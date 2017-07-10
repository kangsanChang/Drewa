/**
 * Created by sanghyoun on 2017. 7. 5..
 */

class Mailservice {
    constructor(smtp) {
        this._nodemailer = require('nodemailer');
        this._smtp = require(__dirname + '/../config/config.json')[smtp];
        this._transporter = this._nodemailer.createTransport(this._smtp);
    }

    static async sendVerification(receiver) {
        const code = Math.floor(Math.random() * 8999) + 1000;
        const mailOptions = {
            from: '"디프만 리크루트" <recruit@depromeet.com>',
            to: receiver,
            subject: '[디프만] 이메일 인증 코드입니다.',
            text: '아래의 코드를 입력해주세요.\nCODE : ' + code
        };
        return this.getInstace().send(mailOptions);
    }

    static async sendHello(receiver) {
        try {
            if (!receiver) {
                throw new Error('There is no Receiver')
            }
            const mailOptions = {
                from: '"디프만 리크루트" <recruit@depromeet.com>',
                to: receiver,
                subject: '[디프만] 지원해주셔서 감사합니다',
                text: '귀하의 지원서가 정상적으로 접수되었습니다.\n접수해주셔서 감사합니다'
            };
            return await this.getInstace().send(mailOptions);
        } catch (err) {
            throw err
        }
    }

    send(mailOptions) {
        return new Promise((resolve, reject) => {
            this._transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error)
                }
                console.log('샌드 : ', info);
                resolve(info.messageId);
            });
        });
    }

    static getInstace() {
        if (global.email === undefined) {
            global.email = new Mailservice('hincosmtp');
        }
        return global.email
    }
}
module.exports = Mailservice;