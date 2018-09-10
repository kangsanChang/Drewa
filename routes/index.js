const auth = require('../controller/jwtAuth')().authenticate();

const {
  applicantSignUp, getApplicantStatus, getApplicantsTimes,
} = require('../controller/applicant');

const {
  postApplication, getApplicationData, removeApplication, submitApplication,
} = require('../controller/applications');

const {
  onlyApplicant, onlyInterviewer, onlyAdmin, checkSubmit, checkTime, login,
} = require('../controller/authController');

const {
  imgUpload, portfolioUpload, posterUpload,
  fileUploadCB, posterUploadCB, removeImage, removePortfolio,
} = require('../controller/fileUpload');

const {
  getMainInfo, getAllRecruitmentSeason, postRecruitInfo, getRecruitInfo, removeRecruitInfo,
  seasonEnd,
} = require('../controller/recruitmentInfo');

const {
  interviewerSignUp,
} = require('../controller/interviewer');

const {
  getApplications, getEvalData, postComment, deleteComment, setPoint, passApplications,
} = require('../controller/evaluation');

// /api/ 하위로 들어옴

module.exports = (router) => {
  // 임시(면접관 가입)
  router.route('/interviewer')
    .post(interviewerSignUp);
  // 로그인
  router.route('/login')
  // 로그인, 토큰 발급 (면접관, 지원자)
    .post(login);
  // 지원자 관련
  router.route('/applicants')
  // 지원자 등록
    .post(applicantSignUp);

  // 지원서 관련 (지원자) - 본인 권한 필요
  router.route('/applicants/:applicantIdx/application')
  // 지원서 등록, 수정 (upsert)
    .post(auth, onlyApplicant, checkTime, checkSubmit, postApplication)
    // 지원서 보기 (수정시 본인 지원서 볼때)
    .get(auth, getApplicationData)
    // 지원서 삭제 (본인 지원서 삭제 할 경우)
    .delete(auth, onlyApplicant, checkTime, checkSubmit, removeApplication);

  // 지원서 제출 (확정)
  router.route('/applicants/:applicantIdx/application/submit')
    .post(auth, onlyApplicant, checkTime, checkSubmit, submitApplication);

  // 지원서 내부 업로드 (사진, 포폴)
  router.route('/applicants/:applicantIdx/application/picture')
    .post(auth, onlyApplicant, checkSubmit, imgUpload, fileUploadCB)
    // 사진 삭제
    .delete(auth, onlyApplicant, checkSubmit, removeImage);
  router.route('/applicants/:applicantIdx/application/portfolio')
  // 포트폴리오 등록 <input name='user_portfolio'> 기준
    .post(auth, onlyApplicant, checkSubmit, portfolioUpload, fileUploadCB)
    // 포트폴리오 삭제
    .delete(auth, onlyApplicant, checkSubmit, removePortfolio);

  // 지원자 상태 가져오기
  router.route('/applicants/:applicantIdx/status')
    .get(auth, onlyApplicant, getApplicantStatus);

  // 평가 정보 가져오기, 평가하기 (면접관)
  router.route('/evaluation/application')
    .get(auth, getApplications) // 제출 된 application 전체 가져오기 (표에서 사용)
    .post(auth, passApplications); // 서류 합격자 보내기 (admin 전용)
  router.route('/evaluation/application/:applicantIdx')
    .get(auth, getEvalData); // 면접관들이 써 놓은 코멘트, 내 점수 가져오기
  router.route('/evaluation/application/:applicantIdx/point')
    .post(auth, setPoint); // 면접관 개인이 점수 주기
  router.route('/evaluation/application/:applicantIdx/comments')
    .post(auth, postComment); // 면접관 개인이 코멘트 달기
  router.route('/evaluation/application/:applicantIdx/comments/:id')
    .delete(auth, deleteComment);

  // recruitment info 가져오기
  router.route('/recruitmentinfo/main')
    .get(getMainInfo);
  router.route('/recruitmentinfo/:season')
    .get(auth, getRecruitInfo)
    .post(auth, postRecruitInfo)
    .delete(auth, removeRecruitInfo);
  // 해당 시즌 포스터 업로드
  router.route('/recruitmentinfo/:season/poster')
    .post(auth, posterUpload, posterUploadCB);
  router.route('/recruitmentinfo/:season/end')
    .put(auth, seasonEnd);
  router.route('/recruitmentinfo')
    .get(auth, getAllRecruitmentSeason);
  return router;
};
