    const userRoutes = require('./userRoutes');
    const planRoutes = require('./planRoutes');
    const adminRoutes = require('./adminRoutes');
    const legaldraft = require('./legaldraft');
    const contact = require('./contact');
    const Razorpaygateway = require('./Razorpaypayment');
    const history = require('./historyviews');
    const adminhistory = require('./adminchat');
    const courseRoute = require('./courseRoute');
    const paymentRoutes = require('./paymentRoutes');
    const authorization = require('../middleware/authorization');
    const adminauth = require('./adminauth');
    const admindashcount = require('./historycount');
    const documents = require('./documents');
    const ecourtRoute = require('./ecourtRoute');
    const ecourtWebhookRoute = require('./ecourtWebhookRoute');
    const appRoutesAssigner = (app) => {

    app.use('/auth', userRoutes);
    app.use('/contact', contact);
    app.use('/history',authorization, history);
    app.use('/adminhistory', adminhistory);
    app.use('/legaldraft',authorization, legaldraft);
    app.use('/admin', adminRoutes);
    app.use('/admincount', admindashcount);
    app.use('/adminauth', adminauth);
    app.use('/plan', planRoutes);
    app.use('/payment', Razorpaygateway);
    app.use('/course',authorization, courseRoute);
    app.use('/commanprofile', authorization, paymentRoutes);
    app.use ('/document_ledger', documents);
    app.use('/webhooks/whatsapp',ecourtWebhookRoute);
    app.use('/ecourt', authorization, ecourtRoute);

   };
    module.exports = appRoutesAssigner;