const auth = require('../controller/jwtAuth')().authenticate();

const {
  applicantSignUp, getAllApplicant, getApplicantStatus
} = require('../controller/applicant');

const {
  postApplication, getApplications, getMyApplication, removeApplication, submitApplication,
} = require('../controller/applications');

const {
  onlyApplicant, onlyInterviewer, checkSubmit, checkTime, postLogin,
} = require('../controller/authController');

// TODO(SH) : 포트폴리오와 프로필 이미지 업로드 멀터 개선해야함 새로 짜야할듯.
const {
  uploadPic, portfolioUpload, removePicture, removePortfolio, uploadFile,
} = require('../controller/fileUpload');

const {
  getAllRecruitmentSeason, postRecruitInfo, getRecruitInfo, removeRecruitInfo, seasonEnd
} = require('../controller/recruitmentInfo');

const {
  interviewerSignUp,
} = require('../controller/interviewer');

// /api/ 하위로 들어옴

module.exports = (router) => {
  // 임시(면접관 가입)
  router.route('/interviewer')
    .post(interviewerSignUp);
  // 로그인
  router.route('/login')
  // 로그인, 토큰 발급 (면접관, 지원자)
    .post(postLogin); // 면접관 로그인 페이지도 따로 필요할 듯
  // 지원자 관련
  router.route('/applicants')
  // 지원자 등록
    .post(applicantSignUp)
    // 지원자 전체 불러오기 (관리자) - 관리자 권한 필요
    .get(getAllApplicant);

  // 지원서 관련 (지원자) - 본인 권한 필요
  router.route('/applicants/:applicantIdx/application')
  // 지원서 등록, 수정 (upsert)
    .post(auth, onlyApplicant, checkTime, checkSubmit, postApplication)
    // 지원서 보기 (수정시 본인 지원서 볼때)
    .get(auth, onlyApplicant, getMyApplication)
    // 지원서 삭제 (본인 지원서 삭제 할 경우)
    .delete(auth, onlyApplicant, checkTime, checkSubmit, removeApplication);

  // 지원서 제출 (확정)
  router.route('/applicants/:applicantIdx/application/submit')
    .post(auth, onlyApplicant, checkTime, checkSubmit, submitApplication);

  // 지원서 내부 업로드 (사진, 포폴)
  router.route('/applicants/:applicantIdx/application/picture')
  // 사진 등록 <input name='user_image'> 기준 ***************************** files.uploadFile
    .post(auth, onlyApplicant, checkSubmit, uploadPic)
    // 사진 삭제
    .delete(auth, onlyApplicant, checkSubmit, removePicture);
  router.route('/applicants/:applicantIdx/application/portfolio')
  // 포트폴리오 등록 <input name='user_portfolio'> 기준
    .post(auth, onlyApplicant, checkSubmit, portfolioUpload, uploadFile)
    // 포트폴리오 삭제
    .delete(auth, onlyApplicant, checkSubmit, removePortfolio);

  // 지원자 상태 가져오기
  router.route('/applicants/:applicantIdx/status')
    .get(auth, onlyApplicant, getApplicantStatus);

  // 지원서 관련 (면접관) - 면접관 권한 필요
  router.route('/applications')
  // 지원서 모두 가져오기 (목록)
    .get(getApplications);
  router.route('/applications/:applicantIdx')
  // 특정 지원서 평가 테이블 불러오기
    .get()
    // 특정 지원서 평가한것 보내기
    .post();
  router.route('/recruitmentinfo/:season')
    .get(auth, getRecruitInfo)
    .post(auth, postRecruitInfo)
    .delete(auth, removeRecruitInfo);
  router.route('/recruitmentinfo/:season/end')
    .put(auth, seasonEnd);
  router.route('/recruitmentinfo')
    .get(auth, getAllRecruitmentSeason);
  return router;
};
