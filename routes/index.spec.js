// TEST FOR index.js in router

const app = require('../app');
const request = require('supertest');
const expect = require('chai').expect;

const remover = require('../controller/applications').remover;

// Mocha 의 context (여기선 this.timeout) 와 겹치지 않기 위해서
// Mocha context 를 사용하는 suite callback 으로 arrow function 사용하지 않음.

describe('Test for REST API', function() {
  let initUserToken;
  let initApplicantIdx;
  const initialData = { userEmail: 'T_E_S_T_B_O_Y@gmail.com', userPassword: 'L0NGPaSsWoRd' };
  this.timeout(10000); // wait for DB connection
  // Create initial data
  it('should create initial data successfully.', done => {
    request(app)
      .post('/api/applicants')
      .send(initialData)
      .end((err, res) => {
        const body = res.body;
        initApplicantIdx = body.data.applicantIdx;
        initUserToken = body.data.token;
        expect(res.status).to.be.equal(200);
        expect(body).to.be.an('object');
        expect(body).to.have.property('msg', 'success');
        expect(body).to.have.nested.property('data.token');
        expect(body).to.have.nested.property('data.applicantIdx');
        done();
      });
  });

  // Applicants Register TEST
  describe('- Applicants Register TEST : ', () => {
    const userData = { userEmail: 'P_O_S_T_M_A_N@gmail.com', userPassword: 'L0NGPaSsWoRd' };
    describe('POST /api/applicants', () => {
      // SUCCESS
      let testDataIdx;
      it('should return Token and ApplicantIdx.', done => {
        request(app)
          .post('/api/applicants')
          .send(userData)
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
      it('should return Error object when duplicate emails', done => {
        request(app)
          .post('/api/applicants')
          .send(userData) // Already exist data.
          .end((err, res) => {
            expect(res.body).to.be.an('object');
            expect(res.status).to.be.equal(400);
            expect(res.body).to.have.property('msg', 'User Already Exists');
            expect(res.body).to.have.property('data', null);
            done();
          });
      });
      // 잘못 된 이메일 형식을 사용하는 경우
      it('should return Error object when Invalid email format', done => {
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
      it('should return Error object when there is an empty field(email, pw)', done => {
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
      it('should return Error object when there is an empty field(pw)', done => {
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
      after(async () => { await remover(testDataIdx); });
    });
  });

  // Applicant LOGIN
  describe('- Applicants Login TEST', () => {
    describe('POST /api/login', () => {
      // SUCCESS
      it('should return AccessToken and ApplicantIdx.', done => {
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
      it('should return Error object when there is an empty field', done => {
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
      it('should return Error object when can not find an email', done => {
        request(app)
          .post('/api/login')
          .send({ userEmail: 'Wrong_E_m_a_i_l@hgmail.com', userPassword: 'PASSw0rd' })
          .end((err, res) => {
            const body = res.body;
            expect(res.status).to.be.equal(400);
            expect(body).to.be.an('object');
            expect(body).to.have.property('msg', 'Email not exist');
            expect(body).to.have.property('data', null);
            done();
          });
      });
      it('should return Error object when input wrong password', done => {
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

  // Remove initial data : All suite finished
  after(async () => { await remover(initApplicantIdx); });
});
