const { getPool } = require('../database/db');
const db = getPool();


exports.SubscriptionPlan = (req, res) => {
  db.query(`SELECT * FROM  subscription_plans WHERE disabled = 0`,null,(err,result)=>{
if(err){
throw err;
}
res.status(200).send(result)
})
};

exports.Features=(req,res)=>{

  db.query(`SELECT feat.*,pln.razorpay_plan_id ,pln.disabled
              FROM Features feat
              LEFT JOIN subscription_plans pln ON feat.plan_id = pln.id
              WHERE pln.disabled = 0`,null,(err,result)=>{
    if(err){
      throw err;
    }
    res.status(200).send(result)
  })
}



exports.Firadyplan = (req, res) => {

  const sqlGlobal = `SELECT active_block_friday FROM settings LIMIT 1`;

  db.query(sqlGlobal, (err, globalResult) => {
    if (err) {
      console.error("Global Query Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    const blackFriday =
      globalResult && globalResult.length > 0
        ? Number(globalResult[0].active_block_friday) === 1
        : false;

    return res.status(200).json({
      success: true,
      blackFriday,
    });
  });
};