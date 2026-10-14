require("dotenv").config();
const { getPool } = require("../database/db");
const db = getPool();
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getAwsSecrets } = require("../utils/razorpayvalut");

exports.getAllCourses =  (req,res) =>{

    const sql = `SELECT id, course_title, description, thumbnail_url, is_published, module_count, created_at
    FROM courses 
    ORDER BY created_at DESC`;

    db.query(sql,(err, result)=>{
        if(err){
           return res.status(500).json({message:"Internal Server Error", error: err})
        }
        res.status(200).json({result})
    })
}

exports.getCourseById = (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT
      c.id,
      c.course_title,
      c.description,
      c.thumbnail_url,
      c.is_published,
      c.module_count,
      c.created_at,
      IFNULL(uc.progress_percentage, 0) AS progress_percentage
    FROM courses c
    LEFT JOIN user_courses uc
      ON uc.course_id = c.id
      AND uc.user_id = ?
    ORDER BY c.created_at DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: err,
      });
    }

    // ✅ Always return courses
    return res.status(200).json({ result });
  });
};


exports.createModuleWithVideoUrl = (req, res) => {
  const { courseId } = req.params;

  const {
    module_title,
    description,
    lesson_notes,
    assessment,
    topic_count,
    order_index,
    video_url,
    duration_minutes,
  } = req.body;

  // ❌ prevent wrong payload
  if ("duration_seconds" in req.body) {
    return res.status(400).json({
      message:
        "Send duration_minutes only. duration_seconds is auto-calculated",
    });
  }

  // ✅ validation
  if (
    !courseId ||
    !module_title ||
    order_index === undefined ||
    !video_url ||
    duration_minutes === undefined ||
    topic_count === undefined
  ) {
    return res.status(400).json({
      message: "All required fields are missing",
    });
  }

  // ✅ minutes → seconds
  const duration_seconds = Math.round(Number(duration_minutes) * 60);

  if (!Number.isInteger(duration_seconds) || duration_seconds <= 0) {
    return res.status(400).json({
      message: "Invalid duration_minutes value",
    });
  }

  // ✅ insert module
  const insertSql = `
    INSERT INTO modules
    (
      course_id,
      module_title,
      description,
      lesson_notes,
      assessment,
      topic_count,
      order_index,
      video_url,
      duration_seconds
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    courseId,
    module_title,
    description || null,
    lesson_notes || null,
    resources ? JSON.stringify(resources) : null,
    assessment ? JSON.stringify(assessment) : null,
    topic_count,
    order_index,
    video_url,
    duration_seconds,
  ];

  db.query(insertSql, values, (err, result) => {
    if (err) {
      console.error("MODULE INSERT ERROR:", err);
      return res.status(500).json({
        message: "Failed to create module",
      });
    }

    // ✅ update module count
    db.query(
      "UPDATE courses SET module_count = module_count + 1 WHERE id = ?",
      [courseId],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({
            message: "Module created but failed to update course module count",
          });
        }

        return res.status(201).json({
          message: "Module created successfully",
          module_id: result.insertId,
          duration_seconds,
        });
      }
    );
  });
};

exports.getModulesByUserCourseId = (req, res) => {
  const { userId, courseId } = req.params;

  if (!userId || !courseId) {
    return res.status(400).json({
      message: "User ID and Course ID are required",
    });
  }

  const sql = `
    SELECT
      m.id AS module_id,
      m.module_title,
      m.description,
      m.detail_description,
      m.lesson_notes,
      m.resources,
      m.assessment,
      m.topic_count,
      m.order_index,
      m.video_url,
      m.duration_seconds,

      IFNULL(ump.watched_seconds, 0) AS watched_seconds,
      IFNULL(ump.progress_percentage, 0) AS progress_percentage,
      IFNULL(ump.is_completed, 0) AS is_completed,

      IFNULL(am.module_percentage, NULL) AS module_percentage

    FROM user_courses uc
    JOIN courses c
      ON c.id = uc.course_id AND c.is_published = 1
    JOIN modules m
      ON m.course_id = c.id

    LEFT JOIN user_module_progress ump
      ON ump.module_id = m.id AND ump.user_id = uc.user_id

    LEFT JOIN (
      SELECT
        user_id,
        course_id,
        module_id,
        MAX(module_percentage) AS module_percentage
      FROM course_module_assessment_submissions
      GROUP BY user_id, course_id, module_id
    ) am
      ON am.user_id = uc.user_id
      AND am.course_id = c.id
      AND am.module_id = m.id

    WHERE uc.user_id = ?
      AND c.id = ?
    ORDER BY m.order_index ASC
  `;

  db.query(sql, [userId, courseId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch modules" });
    }

    if (rows.length === 0) {
      return res.status(403).json({
        message: "Purchase the plan or course to access modules",
      });
    }

    // 🔹 find last completed module
    let lastCompleted = 0;
    rows.forEach((m) => {
      if (m.is_completed === 1 && m.order_index > lastCompleted) {
        lastCompleted = m.order_index;
      }
    });

    // 🔹 module-safe response
    const modules = rows.map((m) => {
      const isUnlocked =
        m.is_completed === 1 || m.order_index === lastCompleted + 1;

      return {
        course_id: Number(courseId),
        module_id: m.module_id,
        module_title: m.module_title,
        description: m.description,
        topic_count: m.topic_count,
        order_index: m.order_index,
        duration_seconds: m.duration_seconds,

        watched_seconds: m.watched_seconds,
        progress_percentage: m.progress_percentage,
        is_completed: m.is_completed,

        // ✅ assessment result
        module_percentage: m.module_percentage, // NULL if not attempted

        is_locked: !isUnlocked,

        detail_description: isUnlocked ? m.detail_description : null,
        lesson_notes: isUnlocked ? m.lesson_notes : null,
        resources: isUnlocked ? m.resources : null,
        assessment: isUnlocked ? m.assessment : null,
        video_url: isUnlocked ? m.video_url : null,
      };
    });

    return res.status(200).json({
      user_id: Number(userId),
      course_id: Number(courseId),
      modules,
    });
  });
}; 

exports.updateProgress = (req, res) => {
  const { user_id, module_id, watched_seconds } = req.body;

  // 0️⃣ Basic validation
  if (
    !user_id ||
    !module_id ||
    watched_seconds === undefined ||
    watched_seconds < 0
  ) {
    return res.status(400).json({ message: "Invalid input" });
  }

  // 1️⃣ Get module details
  const moduleSql = `
    SELECT id, course_id, order_index, duration_seconds
    FROM modules
    WHERE id = ?
  `;

  db.query(moduleSql, [module_id], (err, moduleRows) => {
    if (err || moduleRows.length === 0) {
      return res.status(404).json({ message: "Module not found" });
    }

    const { course_id, order_index, duration_seconds } = moduleRows[0];

    // 2️⃣ Ensure user is enrolled in the course
    const enrollSql = `
      SELECT 1 FROM user_courses
      WHERE user_id = ? AND course_id = ?
    `;

    db.query(enrollSql, [user_id, course_id], (enrollErr, enrollRows) => {
      if (enrollErr) {
        return res.status(500).json({ message: "DB error" });
      }

      if (enrollRows.length === 0) {
        return res.status(403).json({
          message: "User is not enrolled in this course",
        });
      }

      // 🔒 3️⃣ Lock enforcement (no skipping modules)
      const lockCheckSql = `
        SELECT 1
        FROM modules m
        LEFT JOIN user_module_progress ump
          ON ump.module_id = m.id AND ump.user_id = ?
        WHERE m.course_id = ?
          AND m.order_index < ?
          AND (ump.is_completed IS NULL OR ump.is_completed = 0)
        LIMIT 1
      `;

      db.query(
        lockCheckSql,
        [user_id, course_id, order_index],
        (lockErr, lockRows) => {
          if (lockErr) {
            return res.status(500).json({ message: "DB error" });
          }

          if (lockRows.length > 0) {
            return res.status(403).json({
              message:
                "Module is locked. Complete previous modules to unlock this one.",
            });
          }

          // 4️⃣ Cap watched time
          const safeWatched = Math.min(watched_seconds, duration_seconds);

          // 5️⃣ Calculate progress percentage safely
          const progressPercentage =
            duration_seconds > 0
              ? Number(
                  Math.min(100, (safeWatched / duration_seconds) * 100).toFixed(
                    2
                  )
                )
              : 0;

          // 6️⃣ Completion rule (90%)
          const completed =
            safeWatched >= Math.floor(duration_seconds * 0.9) ? 1 : 0;

          // 7️⃣ Check previous completion state
          const checkSql = `
            SELECT is_completed
            FROM user_module_progress
            WHERE user_id = ? AND module_id = ?
          `;

          db.query(checkSql, [user_id, module_id], (err, rows) => {
            const wasCompleted = rows.length > 0 && rows[0].is_completed === 1;

            // 8️⃣ UPSERT module progress (FIXED & SAFE)
            const progressSql = `
              INSERT INTO user_module_progress
              (
                user_id,
                module_id,
                watched_seconds,
                progress_percentage,
                is_completed,
                completed_at
              )
              VALUES (?, ?, ?, ?, ?, IF(? = 1, NOW(), NULL))
              ON DUPLICATE KEY UPDATE
                watched_seconds = GREATEST(watched_seconds, VALUES(watched_seconds)),
                progress_percentage = GREATEST(
                  progress_percentage,
                  VALUES(progress_percentage)
                ),
                is_completed = VALUES(is_completed),
                completed_at = IF(
                  completed_at IS NULL AND VALUES(is_completed) = 1,
                  NOW(),
                  completed_at
                ),
                updated_at = NOW()
 `;

            db.query(
              progressSql,
              [
                user_id,
                module_id,
                safeWatched,
                progressPercentage,
                completed,
                completed,
              ],
              (progressErr) => {
                if (progressErr) {
                  return res.status(500).json({ message: "DB error" });
                }

                // 9️⃣ Update course progress only on first completion
                if (!wasCompleted && completed === 1) {
                  updateCourseProgress(user_id, course_id);
                }

                return res.json({
                  message: "Progress updated",
                  watched_seconds: safeWatched,
                  progress_percentage: progressPercentage,
                  is_completed: Boolean(completed),
                });
              }
            );
          });
        }
      );
    });
  });
};

const updateCourseProgress = (userId, courseId) => {
  const totalSql = `
    SELECT COUNT(*) AS total
    FROM modules
    WHERE course_id = ?`;

  db.query(totalSql, [courseId], (err, totalRows) => {
    if (err || totalRows.length === 0) return;

    const totalModules = totalRows[0].total;
    if (totalModules === 0) return;

    const completedSql = `
      SELECT COUNT(*) AS completed
      FROM user_module_progress ump
      JOIN modules m ON m.id = ump.module_id
      WHERE ump.user_id = ?
        AND m.course_id = ?
        AND ump.is_completed = 1`;

    db.query(completedSql, [userId, courseId], (err, completedRows) => {
      if (err) return;

      const completedModules = completedRows[0].completed;

      const progressPercentage = Number(
        ((completedModules / totalModules) * 100).toFixed(2)
      );

      const updateSql = `
        UPDATE user_courses
        SET progress_percentage = ?,
            completed_at = IF(
              ? = 100 AND completed_at IS NULL,
              NOW(),
              completed_at
            ),
            updated_at = NOW()
        WHERE user_id = ? AND course_id = ?
      `;

      db.query(updateSql, [
        progressPercentage,
        progressPercentage,
        userId,
        courseId,
      ]);
    });
  });
};

// assessment controller

exports.submitAssessment = async (req, res) => {
  const { user_id, course_id, module_id, answers } = req.body;

  try {
    // 1️⃣ Prevent re-submission
    const [existing] = await db.promise().query(
      `SELECT id
       FROM course_module_assessment_submissions
       WHERE user_id=? AND course_id=? AND module_id=?
       LIMIT 1`,
      [user_id, course_id, module_id]
    );

    if (existing.length > 0) {
      return res.status(403).json({
        message: "Assessment already submitted",
      });
    }

    // 2️⃣ Fetch assessment questions in fixed order
    const [questions] = await db.promise().query(
      `SELECT id, correct_answer
       FROM course_module_assessments
       WHERE course_id=? AND module_id=?
       ORDER BY id ASC`,
      [course_id, module_id]
    );

    if (questions.length === 0) {
      return res.status(404).json({
        message: "No assessment found",
      });
    }

    // 3️⃣ Convert answers object → array (index based)
    const answerValues = Object.values(answers);

    let correctCount = 0;
    const insertValues = [];

    // 4️⃣ Match answers by index
    questions.forEach((q, index) => {
      const userAnswer = answerValues[index] ?? null;
      const isCorrect = userAnswer === q.correct_answer;

      if (isCorrect) correctCount++;

      insertValues.push([
        user_id,
        course_id,
        module_id,
        q.id, // assessment_id
        userAnswer,
        isCorrect,
      ]);
    });

    // 5️⃣ Insert all answers (bulk insert)
    await db.promise().query(
      `INSERT INTO course_module_assessment_submissions
       (user_id, course_id, module_id, assessment_id, user_answer, is_correct)
       VALUES ?`,
      [insertValues]
    );

    // 6️⃣ Calculate module percentage
    const percentage = Number(
      ((correctCount / questions.length) * 100).toFixed(2)
    );

    // 7️⃣ Update module percentage (same rows)
    await db.promise().query(
      `UPDATE course_module_assessment_submissions
       SET module_percentage=?
       WHERE user_id=? AND course_id=? AND module_id=?`,
      [percentage, user_id, course_id, module_id]
    );

    // 8️⃣ Response
    res.json({
      message: "Assessment submitted successfully",
      total_questions: questions.length,
      correct_answers: correctCount,
      module_percentage: percentage,
    });
  } catch (error) {
    console.error("Assessment submit error:", error);
    res.status(500).json({
      message: "Assessment submission failed",
    });
  }
};


exports.getSubmittedAssessment = async (req, res) => {
  const { userId, courseId, moduleId } = req.params;

  try {
    const [rows] = await db.promise().query(
      `SELECT 
         assessment_id,
         user_answer,
         is_correct,
         module_percentage
       FROM course_module_assessment_submissions
       WHERE user_id=? AND course_id=? AND module_id=?
       ORDER BY assessment_id ASC`,
      [userId, courseId, moduleId]
    );

    if (rows.length === 0) {
      return res.json({ submitted: false });
    }

    res.json({
      submitted: true,
      module_percentage: rows[0].module_percentage,
      answers: rows.map((r) => ({
        assessment_id: r.assessment_id,
        user_answer: r.user_answer,
        is_correct: r.is_correct,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch submitted assessment",
    });
  }
};


const generateCertificateId = async () => {
  const PREFIX = "JBSP";

  const [rows] = await db.promise().query(
    `SELECT certificate_id
     FROM user_courses
     WHERE certificate_id LIKE 'JBSP%'
     ORDER BY certificate_id DESC
     LIMIT 1`
  );

  if (rows.length === 0) {
    return "JBSP0000001";
  }

  const lastId = rows[0].certificate_id;
  const number = parseInt(lastId.replace(PREFIX, ""), 10) + 1;

  return PREFIX + String(number).padStart(6, "0");
};


let awsSecrets;
let s3Client;

(async () => {
  try {
    awsSecrets = await getAwsSecrets();
    s3Client = new S3Client({
      region: awsSecrets.region,
      credentials: {
        accessKeyId: awsSecrets.accessKeyId,
        secretAccessKey: awsSecrets.secretAccessKey,
      },
    });
  } catch (err) {
    console.error("❌ AWS secrets init failed:", err);
  }
})();


exports.generateCertificateOnDemand = async (req, res) => {
  try {
    const { user_id, course_id } = req.body;

    if (!user_id || !course_id) {
      return res.status(400).json({
        message: "user_id and course_id are required",
      });
    }

    const [rows] = await db.promise().query(
      `SELECT 
         uc.progress_percentage,
         uc.certificate_id,
         uc.certificate_url,
         cs.username
       FROM user_courses uc
       JOIN chatsignup cs ON cs.id = uc.user_id
       WHERE uc.user_id = ? AND uc.course_id = ?`,
      [user_id, course_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Course not found for user" });
    }

    const { progress_percentage, certificate_id, certificate_url, username } =
      rows[0];

    if (certificate_id && certificate_url) {
      return res.status(200).json({
        message: "Certificate already generated",
        certificate_id,
        certificate_url,
      });
    }

    if (progress_percentage < 95) {
      return res.status(403).json({
        message: "Complete at least 95% to download certificate",
      });
    }

    const certificateId = await generateCertificateId();

    const templateBytes = fs.readFileSync(
      path.join(__dirname, "../public/course.pdf")
    );

    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText(username.toUpperCase(), {
      x: 355,
      y: 385,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`${certificateId}`, {
      x: 443,
      y: 478,
      size: 14,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    const pdfBytes = await pdfDoc.save();

    const s3Key = `certificates/${certificateId}.pdf`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: awsSecrets.bucket,
        Key: s3Key,
        Body: Buffer.from(pdfBytes),
        ContentType: "application/pdf",
      })
    );

    const certificateUrl = `https://${awsSecrets.bucket}.s3.${awsSecrets.region}.amazonaws.com/${s3Key}`;


    await db.promise().query(
      `UPDATE user_courses
       SET certificate_id = ?,
           certificate_url = ?,
           completed_at = NOW()
       WHERE user_id = ? AND course_id = ?`,
      [certificateId, certificateUrl, user_id, course_id]
    );

    return res.status(200).json({
      message: "Certificate generated successfully",
      certificate_id: certificateId,
      certificate_url: certificateUrl,
    });
  } catch (err) {
    console.error("Certificate generation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};