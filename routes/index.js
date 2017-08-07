const applicant = require('../controller/applicant');
const applications = require('../controller/applications');
const auth = require('../controller/authController');


module.exports = (router) => {
  // Applicant
  router.route('/applicant/login')
        .post(applicant.postLogin);
  router.route('/applicant/signup')
        .post(applicant.postSignUp);
  router.route('/applicant/verify')
        .get(auth.authenticate, applicant.tokenVerify);
  // Applications
  router.route('/')
        .post(applications.postApplications)
        .get(applications.getApplications);
  router.route('/:userIdx')
        .get(applications.getApplication);
  return router;
};
