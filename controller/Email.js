/**
 * Created by sanghyoun on 2017. 7. 5..
 */
const nodemailer = require('nodemailer');
const smtps = require('../config/config.json');

class Mailservice {
  constructor(smtp) {
    this.transporter = nodemailer.createTransport(smtps[smtp]);
  }
  static async sendTest(req, res, next) {
    const result = await Mailservice.sendVerification(req.body.addr);
    res.json(result);
  }
  static async sendVerification(receiver) {
    try {
      const code = Math.floor(Math.random() * 8999) + 1000;
      const mailOptions = {
        from: '"디프만" <apply@depromeet.com>',
        to: receiver,
        subject: '[디프만] 이메일 인증 코드입니다.',
        text: `아래의 코드를 입력해주세요.\nCODE : ${code}`,
      };
      return await this.getInstace().send(mailOptions);
    } catch (err) {
      throw err;
    }
  }

  static async sendHello(receiver) {
    try {
      if (!receiver) {
        throw new Error('There is no Receiver');
      }
      const mailOptions = {
        from: '"디프만" <apply@depromeet.com>',
        to: receiver,
        subject: '[디프만] 지원해주셔서 감사합니다',
        text: '귀하의 지원서가 정상적으로 접수되었습니다.\n접수해주셔서 감사합니다',
      };
      return await this.getInstace().send(mailOptions);
    } catch (err) {
      throw err;
    }
  }

  send(mailOptions) {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        }
        // console.log('샌드 : ', info);
        // 메일 받은 대상 email 주소 반환함
        resolve(info.envelope.to[0]);
      });
    });
  }

  static getInstace() {
    if (global.email === undefined) {
      global.email = new Mailservice('gsmtp');
    }
    return global.email;
  }
}
module.exports = Mailservice;
