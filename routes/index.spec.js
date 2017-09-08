// TEST FOR index.js in router

const app = require('../app');
const request = require('supertest');
const expect = require('chai').expect;

const remover = require('../controller/applications').remover;

// Mocha 의 context (여기선 this.timeout) 와 겹치지 않기 위해서
// Mocha context 를 사용하는 suite callback 으로 arrow function 사용하지 않음.

describe('Test for REST API', function() {
  let initApplicantToken;
  let initApplicantIdx;
  const initialData = { userEmail: 'T_E_S_T_B_O_Y@gmail.com', userPassword: 'L0NGPaSsWoRd' };
  this.timeout(15000); // wait for DB connection
  // Create initial data
  it('should create initial data successfully.', (done) => {
    request(app)
      .post('/api/applicants')
      .send(initialData)
      .end((err, res) => {
        const body = res.body;
        initApplicantIdx = body.data.applicantIdx;
        initApplicantToken = body.data.token;
        expect(res.status).to.be.equal(200);
        expect(body).to.be.an('object');
        expect(body).to.have.property('msg', 'success');
        expect(body).to.have.nested.property('data.token');
        expect(body).to.have.nested.property('data.applicantIdx');
        done();
      });
  });

  // Applicants Register TEST
  describe('- Applicants Register TEST :', () => {
    describe('POST /api/applicants', () => {
      const testData = { userEmail: 'P_O_S_T_M_A_N@gmail.com', userPassword: 'L0NGPaSsWoRd' };
      let testDataIdx;
      // SUCCESS
      it('should return Token and ApplicantIdx.', (done) => {
        request(app)
          .post('/api/applicants')
          .send(testData)
          .end((err, res) => {
            const body = res.body;
            testDataIdx = body.data.applicantIdx;
            expect(res.status).to.be.equal(200);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'success');
            expect(body).to.have.nested.property('data.token');
            expect(body).to.have.nested.property('data.applicantIdx');
            done();
          });
      });
      // FAIL
      // 이메일 중복 되는 경우
      it('should return Error object when duplicate emails', (done) => {
        request(app)
          .post('/api/applicants')
          .send(testData) // Already exist data.
          .end((err, res) => {
            expect(res.body).to.be.an('object');
            expect(res.status).to.be.equal(400);
            expect(res.body).to.have.property('msg', 'User Already Exists');
            expect(res.body).to.have.property('data', null);
            done();
          });
      });
      // 잘못 된 이메일 형식을 사용하는 경우
      it('should return Error object when Invalid email format', (done) => {
        request(app)
          .post('/api/applicants')
          .send({ userEmail: 'wrongEmail.com', userPassword: 'PASSw0rd' })
          .end((err, res) => {
            expect(res.body).to.be.an('object');
            expect(res.status).to.be.equal(400);
            expect(res.body).to.have.property(
              'msg', 'Validation error: Validation isEmail on userEmail failed');
            expect(res.body).to.have.property('data', null);
            done();
          });
      });
      // 이메일 또는 패스워드 칸이 비어있는 경우
      it('should return Error object when there is an empty field(email, pw)', (done) => {
        request(app)
          .post('/api/applicants')
          .send({ userEmail: '', userPassword: '' })
          .end((err, res) => {
            expect(res.body).to.be.an('object');
            expect(res.status).to.be.equal(400);
            expect(res.body).to.have.property('msg', 'There is an empty field');
            expect(res.body).to.have.property('data', null);
            done();
          });
      });
      it('should return Error object when there is an empty field(pw)', (done) => {
        request(app)
          .post('/api/applicants')
          .send({ userEmail: 'hello_T_E_S_T_@gmail.com', userPassword: '' })
          .end((err, res) => {
            expect(res.body).to.be.an('object');
            expect(res.status).to.be.equal(400);
            expect(res.body).to.have.property('msg', 'There is an empty field');
            expect(res.body).to.have.property('data', null);
            done();
          });
      });

      // TODO: PASSWORD 한 글자라도 정상처리함. 최소 4 자.. 같은 규칙이 있었으면

      // Remove sample data for test
      after(async () => { await remover(testDataIdx, testData.userEmail); });
    });
  });

  // Applicant LOGIN
  describe('- Applicants Login TEST :', () => {
    describe('POST /api/login', () => {
      // SUCCESS
      it('should return AccessToken and ApplicantIdx.', (done) => {
        request(app)
          .post('/api/login')
          .send(initialData)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(200);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'success');
            expect(body).to.have.nested.property('data.token');
            expect(body).to.have.nested.property('data.applicantIdx', initApplicantIdx);
            done();
          });
      });
      // Fail
      it('should return Error object when there is an empty field', (done) => {
        request(app)
          .post('/api/login')
          .send({ userEmail: '', userPassword: '' })
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(400);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'There is an empty field');
            expect(body).to.have.property('data', null);
            done();
          });
      });
      it('should return Error object when can not find an email', (done) => {
        request(app)
          .post('/api/login')
          .send({ userEmail: 'Wrong_E_m_a_i_l@gmail.com', userPassword: 'PASSw0rd' })
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(400);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'Email not exist');
            expect(body).to.have.property('data', null);
            done();
          });
      });
      it('should return Error object when input wrong password', (done) => {
        request(app)
          .post('/api/login')
          .send({ userEmail: initialData.userEmail, userPassword: 'Wr0ngPassW0rd' })
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(400);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'Password not match');
            expect(body).to.have.property('data', null);
            done();
          });
      });
    });
  });

  // File Upload
  describe('- Applicant File Upload TEST :', () => {
    // 사진
    describe('POST /api/applicants/:applicantIdx/application/picture', () => {
      // 정상적인 경우

      // - 업로드 하는 경우
      it('should return success msg and uploaded URL', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/picture`)
          .set('token', initApplicantToken)
          .attach('user_image', `${__dirname}/../test_files/cat.png`) // 바로 ../ 안먹힌다.
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(200);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'success');
            expect(body).to.have.nested.property('data.url');
            expect(body).to.have.nested.property('data.fileName', 'cat.png');
            done();
          });
      });
      // - 덮어쓰는 경우
      it('should return success msg and uploaded URL (updated)', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/picture`)
          .set('token', initApplicantToken)
          .attach('user_image', `${__dirname}/../test_files/cat2.jpeg`)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(200);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'success');
            expect(body).to.have.nested.property('data.url');
            expect(body).to.have.nested.property('data.fileName', 'cat2.jpeg');
            done();
          });
      });
      // - 사진 삭제하는 경우
      it('should return 204 code when removed successfully', (done) => {
        request(app)
          .delete(`/api/applicants/${initApplicantIdx}/application/picture`)
          .set('token', initApplicantToken)
          .end((err, res) => {
            expect(res.status).to.be.equal(204);
            expect(res.body).to.be.an('object', {});
            done();
          });
      });
      // - 삭제 후 재 업로드
      it('should return success msg and uploaded URL (re-uploaded)', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/picture`)
          .set('token', initApplicantToken)
          .attach('user_image', `${__dirname}/../test_files/cat2.jpeg`)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(200);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'success');
            expect(body).to.have.nested.property('data.url');
            expect(body).to.have.nested.property('data.fileName', 'cat2.jpeg');
            done();
          });
      });

      // 비정상적인 경우

      // - 잘못된 확장자가 올 경우
      it('should return Error object when upload with wrong filename extensions', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/picture`)
          .set('token', initApplicantToken)
          .attach('user_image', `${__dirname}/../test_files/bad_cat.gif`)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(400);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'goes wrong on the filename extensions');
            expect(body).to.have.nested.property('data', null);
            done();
          });
      });
      // - 파일이 지정한 크기보다 큰 경우
      it('should return Error object when upload with too large file', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/picture`)
          .set('token', initApplicantToken)
          .attach('user_image', `${__dirname}/../test_files/big_cat.jpeg`)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(400);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'File too large');
            expect(body).to.have.nested.property('data', null);
            done();
          });
      });
      // - 본인 것이 아닌 다른 지원서에 접근하는 경우
      it('should return Error object when upload file into another user', (done) => {
        const wrongIdx = initApplicantIdx - 1;
        request(app)
          .post(`/api/applicants/${wrongIdx}/application/picture`)
          .set('token', initApplicantToken)
          .attach('user_image', `${__dirname}/../test_files/big_cat.jpeg`)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(403);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'Permission denied');
            expect(body).to.have.nested.property('data', null);
            done();
          });
      });
      // - 토큰 없이 접근 할 경우
      it('should return Error object when upload without token', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/picture`)
          .attach('user_image', `${__dirname}/../test_files/big_cat.jpeg`)
          .end((err, res) => {
            // error handler 로 넘어오지 않고, passport 에서 response 로 에러 줌
            // TODO: passport 따로 custom handling 필요
            expect(res.status).to.be.equal(401); // Unauthenticated. (인증이 필요한 요청)
            done();
          });
      });
    });
    // 포폴
    describe('POST /api/applicants/:applicantIdx/application/portfolio', () => {
      // 정상적인 경우

      // - 업로드 하는 경우
      it('should return success msg and uploaded URL', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/portfolio`)
          .set('token', initApplicantToken)
          .attach('user_portfolio', `${__dirname}/../test_files/포트폴리오_김땡땡.pdf`) // 바로 ../ 안먹힌다.
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(200);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'success');
            expect(body).to.have.nested.property('data.url');
            expect(body).to.have.nested.property('data.fileName', '포트폴리오_김땡땡.pdf');
            done();
          });
      });
      // - 덮어쓰는 경우
      it('should return success msg and uploaded URL (updated)', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/portfolio`)
          .set('token', initApplicantToken)
          .attach('user_portfolio', `${__dirname}/../test_files/포트폴리오_소고기.pdf`)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(200);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'success');
            expect(body).to.have.nested.property('data.url');
            expect(body).to.have.nested.property('data.fileName', '포트폴리오_소고기.pdf');
            done();
          });
      });
      // - 포폴 삭제하는 경우
      it('should return 204 code when removed successfully', (done) => {
        request(app)
          .delete(`/api/applicants/${initApplicantIdx}/application/portfolio`)
          .set('token', initApplicantToken)
          .end((err, res) => {
            expect(res.status).to.be.equal(204);
            expect(res.body).to.be.an('object', {});
            done();
          });
      });
      // - 삭제 후 재 업로드
      it('should return success msg and uploaded URL (re-uploaded)', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/portfolio`)
          .set('token', initApplicantToken)
          .attach('user_portfolio', `${__dirname}/../test_files/포트폴리오_소고기.pdf`)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(200);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'success');
            expect(body).to.have.nested.property('data.url');
            expect(body).to.have.nested.property('data.fileName', '포트폴리오_소고기.pdf');
            done();
          });
      });

      // 비정상적인 경우
      // - 잘못된 확장자가 올 경우
      it('should return Error object when upload with wrong filename extensions', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/portfolio`)
          .set('token', initApplicantToken)
          .attach('user_portfolio', `${__dirname}/../test_files/bad_portfolio.doc`)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(400);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'goes wrong on the filename extensions');
            expect(body).to.have.nested.property('data', null);
            done();
          });
      });
      // - 파일이 지정한 크기보다 큰 경우
      it('should return Error object when upload with too large file', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/portfolio`)
          .set('token', initApplicantToken)
          .attach('user_portfolio', `${__dirname}/../test_files/big_portfolio.pdf`)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(400);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'File too large');
            expect(body).to.have.nested.property('data', null);
            done();
          });
      });
      // - 본인 것이 아닌 다른 지원서에 접근하는 경우
      it('should return Error object when upload file into another user', (done) => {
        const wrongIdx = initApplicantIdx - 1;
        request(app)
          .post(`/api/applicants/${wrongIdx}/application/portfolio`)
          .set('token', initApplicantToken)
          .attach('user_portfolio', `${__dirname}/../test_files/big_cat.jpeg`)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(403);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'Permission denied');
            expect(body).to.have.nested.property('data', null);
            done();
          });
      });
      // - 토큰 없이 접근 할 경우
      it('should return Error object when upload without token', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/portfolio`)
          .attach('user_portfolio', `${__dirname}/../test_files/big_cat.jpeg`)
          .end((err, res) => {
            // error handler 로 넘어오지 않고, passport 에서 response 로 에러 줌
            // TODO: passport 따로 custom handling 필요
            expect(res.status).to.be.equal(401); // Unauthenticated. (인증이 필요한 요청)
            done();
          });
      });
    });
  });
  describe('- Application Save, Submit and GET TEST :', () => {
    // Post json data.
    const testData1 = {
      userName: '김테스트1',
      userPosition: 'developer',
      applicantGender: 'M',
      applicantBirthday: '1990-01-01',
      applicantLocation: '서울',
      applicantPhone: '01012341235',
      applicantOrganization: '해피대학교',
      applicantMajor: '컴퓨터공학과',
      applicantGrade: '',
      entryRoute: '페이스북 디프만 계정 홍보영상보고 지원 했습니다.',
      personalUrl: ['https://facebook.com/apple', 'https://github.com/helloworld'],
      answers: ['재밌어 보여서 지원했습니다 잘 부탁 드립니다.', '디프만 최고', '123123334'],
      interviewAvailableTime: [],
    };
    const testData2 = {
      userName: '김테스트2',
      userPosition: 'developer',
      applicantGender: 'M',
      applicantBirthday: '1990-01-01',
      applicantLocation: '서울',
      applicantPhone: '01012341235',
      applicantOrganization: '해피대학교',
      applicantMajor: '컴퓨터공학과',
      applicantGrade: '3',
      entryRoute: '페이스북 디프만 계정 홍보영상보고 지원 했습니다.',
      personalUrl: ['https://github.com/helloworld'],
      answers: ['재밌어 보여서 지원했습니다 잘 부탁 드립니다.', '디프만 최고', '123123334', '하하'],
      interviewAvailableTime: ['2017-08-25 10:00', '2017-08-26 12:00'],
    };
    const testData3 = {
      userName: '김하하',
      userPosition: 'developer',
      applicantGender: 'M',
      applicantBirthday: '1990-01-01',
      applicantLocation: '서울',
      applicantPhone: '01012341235',
      applicantOrganization: '한국대학교',
      applicantMajor: '컴퓨터공학과',
      entryRoute: '페이스북 디프만 계정 홍보영상보고 지원 했습니다.',
      personalUrl: ['https://github.com/helloworld', 'https://facebook.com/abc1234'],
      answers: ['재밌어 보여서 지원했습니다 잘 부탁 드립니다.', '디프만 최고', '123123334', '하하'],
      interviewAvailableTime: ['2017-08-25 10:00', '2017-08-26 12:00', '2017-08-26 13:00'],
    };
    // 저장하는 경우
    describe('POST /api/applicants/:applicantIdx/application (SAVE)', () => {
      // 정상적으로 저장하는 경우
      it('should return success msg', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application`)
          .set('token', initApplicantToken)
          .send(testData1)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(200);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'success');
            done();
          });
      });
      it('should return success msg (updated)', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application`)
          .set('token', initApplicantToken)
          .send(testData2)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(200);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'success');
            done();
          });
      });
      // - 다른 지원자의 지원서에 저장 하는 경우
      it('should return Error object when upload file into another user', (done) => {
        const wrongIdx = initApplicantIdx - 1;
        request(app)
          .post(`/api/applicants/${wrongIdx}/application`)
          .send(testData1)
          .set('token', initApplicantToken)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(403);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'Permission denied');
            expect(body).to.have.nested.property('data', null);
            done();
          });
      });
      // - 토큰 없이 접근 할 경우
      it('should return Error object when upload without token', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application`)
          .send(testData1)
          .end((err, res) => {
            expect(res.status).to.be.equal(401); // Unauthenticated. (인증이 필요한 요청)
            done();
          });
      });
    });
    // 제출 할 경우
    describe('POST /api/applicants/:applicantIdx/application/submit (SUBMIT)', () => {
      // token 없을 경우
      it('should return Error object when submit without token', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/submit`)
          .send(testData1)
          .end((err, res) => {
            expect(res.status).to.be.equal(401); // Unauthenticated. (인증이 필요한 요청)
            done();
          });
      });
      // 다른 지원자에게 저장하는 경우
      it('should return Error object when submit application into another user', (done) => {
        const wrongIdx = initApplicantIdx - 1;
        request(app)
          .post(`/api/applicants/${wrongIdx}/application/submit`)
          .send(testData1)
          .set('token', initApplicantToken)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(403);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'Permission denied');
            expect(body).to.have.nested.property('data', null);
            done();
          });
      });
      // 정상적으로 제출 할 경우
      it('should return success msg', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application/submit`)
          .set('token', initApplicantToken)
          .send(testData3)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(200);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'success');
            done();
          });
      });
      // - 저장 불가능 해야 함
      it('should return Error object when saving an already submitted application', (done) => {
        request(app)
          .post(`/api/applicants/${initApplicantIdx}/application`)
          .set('token', initApplicantToken)
          .send(testData1)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(400);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', '이미 제출하셨습니다!');
            done();
          });
      });
      // - 제출 불가능 해야 함
      it('should return Error object when submitting an already submitted application',
        (done) => {
          request(app)
            .post(`/api/applicants/${initApplicantIdx}/application/submit`)
            .set('token', initApplicantToken)
            .send(testData2)
            .end((err, res) => {
              const body = res.body;
              expect(res.status).to.be.equal(400);
              expect(body).to.be.an('object');
              expect(body).to.have.property('msg', '이미 제출하셨습니다!');
              done();
            });
        });
      // - 삭제 불가능 해야 함
      it('should return Error object when removing an already submitted application', (done) => {
        request(app)
          .delete(`/api/applicants/${initApplicantIdx}/application`)
          .set('token', initApplicantToken)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(400);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', '이미 제출하셨습니다!');
            done();
          });
      });
      // - 지원서 내부 사진 수정 삭제 불가
      it('should return Error object when removing picture in an already submitted application',
        (done) => {
          request(app)
            .post(`/api/applicants/${initApplicantIdx}/application/picture`)
            .set('token', initApplicantToken)
            .attach('user_image', `${__dirname}/../test_files/cat.png`)
            .end((err, res) => {
              const body = res.body;
              expect(res.status).to.be.equal(400);
              expect(body).to.be.an('object');
              expect(body).to.have.property('msg', '이미 제출하셨습니다!');
              done();
            });
        });
      it('should return Error object when updating picture in an already submitted application',
        (done) => {
          request(app)
            .delete(`/api/applicants/${initApplicantIdx}/application/picture`)
            .set('token', initApplicantToken)
            .end((err, res) => {
              const body = res.body;
              expect(res.status).to.be.equal(400);
              expect(body).to.be.an('object');
              expect(body).to.have.property('msg', '이미 제출하셨습니다!');
              done();
            });
        });
      // - 지원서 내부 포폴 수정 삭제 불가
      it('should return Error object when removing portfolio in an already submitted application',
        (done) => {
          request(app)
            .post(`/api/applicants/${initApplicantIdx}/application/portfolio`)
            .set('token', initApplicantToken)
            .attach('user_portfolio', `${__dirname}/../test_files/포트폴리오_김땡땡.pdf`)
            .end((err, res) => {
              const body = res.body;
              expect(res.status).to.be.equal(400);
              expect(body).to.be.an('object');
              expect(body).to.have.property('msg', '이미 제출하셨습니다!');
              done();
            });
        });
      it('should return Error object when updating portfolio in an already submitted application',
        (done) => {
          request(app)
            .delete(`/api/applicants/${initApplicantIdx}/application/portfolio`)
            .set('token', initApplicantToken)
            .end((err, res) => {
              const body = res.body;
              expect(res.status).to.be.equal(400);
              expect(body).to.be.an('object');
              expect(body).to.have.property('msg', '이미 제출하셨습니다!');
              done();
            });
        });
    });
    // 불러 올 경우
    describe('GET /api/applicants/:applicantIdx/application', () => {
      // 정상적인 경우
      it('should return success msg', (done) => {
        request(app)
          .get(`/api/applicants/${initApplicantIdx}/application`)
          .set('token', initApplicantToken)
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(200);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'success');
            expect(body.data).has.all.keys([
              'userName', 'userPosition', 'applicantGender',
              'applicantBirthday', 'applicantLocation', 'applicantPhone', 'applicantOrganization',
              'applicantMajor', 'applicantPictureFilename', 'entryRoute', 'portfolioFilename',
              'personalUrl', 'answers', 'interviewAvailableTime']);
            expect(body.data).to.have.property('userName', testData3.userName);
            expect(body.data).to.have.property('userPosition', testData3.userPosition);
            expect(body.data).to.have.property('applicantGender', testData3.applicantGender);
            expect(body.data).to.have.property('entryRoute', testData3.entryRoute);
            done();
          });
      });
    });
  });
  // Remove initial data : All suite finished
  after(async () => { await remover(initApplicantIdx, initialData.userEmail); });
});
