const applicant = require('../controller/applicant');
const applications = require('../controller/applications');
const auth = require('../controller/authController').authenticate;

// /api/ 하위로 들어옴

module.exports = (router) => {
  // 로그인
  router.route('/applicant/login')
        // 로그인, 토큰 발급 (면접관, 지원자)
        .post(applicant.postLogin); // 면접관 로그인 페이지도 따로 필요할 듯
  // 지원자 관련
  router.route('/applicants')
        // 지원자 등록
        .post(applicant.postSignUp)
        // 지원자 전체 불러오기 (관리자) - 관리자 권한 필요
        .get(applicant.getAllApplicant);

  // 지원서 관련 (지원자) - 본인 권한 필요
  router.route('/applicants/:applicantId/application')
        // 지원서 등록, 수정 (upsert)
        .post(applications.postApplication)
        // 지원서 보기 (수정시 본인 지원서 볼때)
        .get(applications.getApplication)
        // 지원서 삭제 (본인 지원서 삭제 할 경우)
        .delete(applications.removeApplication);
  // 지원서 내부 업로드 (사진, 포폴)
  router.route('/applicants/:applicantId/application/picture')
        // 사진 등록
        .post()
        // 사진 삭제
        .delete();
  router.route('/applicants/:applicationId/application/portfolio')
        // 포트폴리오 등록
        .post()
        // 포트폴리오 삭제
        .delete();

  // 지원서 관련 (면접관) - 면접관 권한 필요
  router.route('/applications')
        // 지원서 모두 가져오기 (목록)
        .get(applications.getApplications);
  router.route('/applications/:applicantId')
        // 특정 지원서 평가 테이블 불러오기
        .get()
        // 특정 지원서 평가한것 보내기
        .post();
  return router;
};
