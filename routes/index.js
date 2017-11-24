const applicant = require('../controller/applicant');
const applications = require('../controller/applications');
const aController = require('../controller/authController');
const auth = require('../controller/jwtAuth')().authenticate();
const onlyApplicant = aController.onlyApplicant;
const onlyInterviewer = aController.onlyInterviewer;
const checkTime = aController.checkTime;
const checkSubmit = aController.checkSubmit;
const files = require('../controller/fileUpload');
const recruit = require('../controller/recruitmentInfo');
// const imageUpload = files.imageUpload.single('user_image');
const portfolioUpload = files.portfolioUpload.single('user_portfolio');
const uploadPic = files.uploadPic;

// /api/ 하위로 들어옴

module.exports = (router) => {
  // 로그인
  router.route('/login')
  // 로그인, 토큰 발급 (면접관, 지원자)
    .post(aController.postLogin); // 면접관 로그인 페이지도 따로 필요할 듯
  // 지원자 관련
  router.route('/applicants')
  // 지원자 등록
    .post(applicant.applicantSignUp)
    // 지원자 전체 불러오기 (관리자) - 관리자 권한 필요
    .get(applicant.getAllApplicant);

  // 지원서 관련 (지원자) - 본인 권한 필요
  router.route('/applicants/:applicantIdx/application')
  // 지원서 등록, 수정 (upsert)
    .post(auth, onlyApplicant, checkTime, checkSubmit, applications.postApplication)
    // 지원서 보기 (수정시 본인 지원서 볼때)
    .get(auth, onlyApplicant, applications.getMyApplication)
    // 지원서 삭제 (본인 지원서 삭제 할 경우)
    .delete(auth, onlyApplicant, checkTime, checkSubmit, applications.removeApplication);

  // 지원서 제출 (확정)
  router.route('/applicants/:applicantIdx/application/submit')
    .post(auth, onlyApplicant, checkTime, checkSubmit, applications.submitApplication);

  // 지원서 내부 업로드 (사진, 포폴)
  router.route('/applicants/:applicantIdx/application/picture')
  // 사진 등록 <input name='user_image'> 기준 ***************************** files.uploadFile
    .post(auth, onlyApplicant, checkSubmit, uploadPic)
    // 사진 삭제
    .delete(auth, onlyApplicant, checkSubmit, files.removePicture);
  router.route('/applicants/:applicantIdx/application/portfolio')
  // 포트폴리오 등록 <input name='user_portfolio'> 기준
    .post(auth, onlyApplicant, checkSubmit, portfolioUpload, files.uploadFile)
    // 포트폴리오 삭제
    .delete(auth, onlyApplicant, checkSubmit, files.removePortfolio);

  // 지원서 관련 (면접관) - 면접관 권한 필요
  router.route('/applications')
  // 지원서 모두 가져오기 (목록)
    .get(applications.getApplications);
  router.route('/applications/:applicantIdx')
  // 특정 지원서 평가 테이블 불러오기
    .get()
    // 특정 지원서 평가한것 보내기
    .post();
  router.route('/recruitmentInfo')
    .post(auth, onlyInterviewer, recruit.postRecruitInfo)
    // get 은 퍼블릭 권한으로 아무나 조회 가능
    .get(recruit.getRecruitInfo);
  router.route('/recruitmentInfo/:season')
    .put(auth, onlyInterviewer, recruit.putRecruitInfo);
  return router;
};
