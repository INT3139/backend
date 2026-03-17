import nodemailer from 'nodemailer';
import { env } from '@/configs/env';
import { logger } from '@/configs/logger';

export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT === 465, // true for 465, false for other ports
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        });
    }

    async send(options: EmailOptions): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: `"HRM VNU-UET" <${env.SMTP_USER}>`,
                ...options,
            });
            logger.info('Email sent', { messageId: info.messageId, to: options.to });
        } catch (error) {
            logger.error('Failed to send email', { error, to: options.to });
            throw error;
        }
    }

    /**
     * Send welcome email to new user
     */
    async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
        const html = `
            <h1>Chào mừng ${fullName} đến với HRM VNU-UET</h1>
            <p>Tài khoản của bạn đã được tạo thành công trên hệ thống Quản lý Giảng viên.</p>
            <p>Vui lòng đăng nhập và đổi mật khẩu để bắt đầu sử dụng.</p>
        `;
        await this.send({
            to: email,
            subject: 'Chào mừng bạn đến với HRM VNU-UET',
            html,
        });
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const html = `
            <h1>Yêu cầu đặt lại mật khẩu</h1>
            <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
            <p>Vui lòng nhấn vào link bên dưới để thực hiện:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        `;
        await this.send({
            to: email,
            subject: 'Yêu cầu đặt lại mật khẩu - HRM VNU-UET',
            html,
        });
    }
    /**
     * Send email to candidate when status changes
     */
    async sendCandidateStatusEmail(email: string, fullName: string, status: string): Promise<void> {
        let statusText = status;
        if (status === 'accepted') statusText = 'Đã trúng tuyển';
        if (status === 'rejected') statusText = 'Chưa phù hợp';
        if (status === 'interviewing') statusText = 'Mời phỏng vấn';

        const html = `
            <h1>Thông báo trạng thái ứng tuyển</h1>
            <p>Chào ${fullName},</p>
            <p>Chúng tôi xin thông báo trạng thái ứng tuyển của bạn hiện tại là: <strong>${statusText}</strong>.</p>
            <p>Cảm ơn bạn đã quan tâm đến cơ hội nghề nghiệp tại VNU-UET.</p>
        `;
        await this.send({
            to: email,
            subject: 'Thông báo trạng thái ứng tuyển - VNU-UET',
            html,
        });
    }

    /**
     * Send temp password to user after admin reset
     */
    async sendTempPasswordEmail(email: string, fullName: string, tempPassword: string): Promise<void> {
        const html = `
            <h1>Mật khẩu của bạn đã được đặt lại</h1>
            <p>Chào ${fullName},</p>
            <p>Quản trị viên đã đặt lại mật khẩu của bạn. Mật khẩu tạm thời của bạn là: <strong>${tempPassword}</strong></p>
            <p>Vui lòng đăng nhập và đổi mật khẩu ngay lập tức.</p>
        `;
        await this.send({
            to: email,
            subject: 'Mật khẩu tạm thời - HRM VNU-UET',
            html,
        });
    }

    /**
     * Send email when salary proposal is approved
     */
    async sendSalaryApprovalEmail(email: string, fullName: string, grade: number): Promise<void> {
        const html = `
            <h1>Thông báo nâng lương</h1>
            <p>Chào ${fullName},</p>
            <p>Đề xuất nâng lương của bạn đã được phê duyệt. Bạn đã được nâng lên bậc <strong>${grade}</strong>.</p>
            <p>Vui lòng kiểm tra chi tiết trong hệ thống HRM.</p>
        `;
        await this.send({
            to: email,
            subject: 'Thông báo phê duyệt nâng lương - HRM VNU-UET',
            html,
        });
    }
}

export const emailService = new EmailService();
