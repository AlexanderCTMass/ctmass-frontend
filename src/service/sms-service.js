// src/service/sms-service.js
import { firestore } from 'src/libs/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {getAuth} from "firebase/auth";

// Конфигурация для SMS-сервиса (можно вынести в .env)
const SMS_CONFIG = {
    // Используем Twilio или другой SMS-провайдер
    // В данном примере мы сохраняем SMS в Firestore для обработки через cloud function
    SMS_COLLECTION: 'smsQueue'
};

class SMSService {
    /**
     * Отправка SMS через сохранение в очередь Firestore
     * (для обработки через cloud function)
     */
    async sendSMSViaQueue({ to, message, inviterName, categoryTitle, profileId, personalText }) {
        try {
            const smsData = {
                to, // номер в формате +1XXXXXXXXXX
                message: this.createInviteSMS(inviterName, categoryTitle, profileId, personalText),
                status: 'pending',
                createdAt: serverTimestamp(),
                type: 'invite',
                metadata: {
                    inviterName,
                    categoryTitle,
                    profileId,
                    personalText
                }
            };

            const docRef = await addDoc(collection(firestore, SMS_CONFIG.SMS_COLLECTION), smsData);
            console.log('SMS queued with ID:', docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error queueing SMS:', error);
            throw error;
        }
    }

    async sendSMSDirect({ to, message }) {
        try {
            const user = getAuth().currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const token = await user.getIdToken();

            const response = await fetch(`${process.env.REACT_APP_FB_API_URL}/sendSMS`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    to,
                    message,
                    sender: 'CTMASS'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send SMS');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending SMS:', error);
            throw error;
        }
    }

    /**
     * Создание текста SMS-приглашения
     */
    createInviteSMS(inviterName, categoryTitle, profileId, personalText) {
        const link = `${process.env.REACT_APP_HOST_FOR_ENV}/register?invite=${profileId}`;
        const shortLink = link; // Здесь можно добавить сервис сокращения ссылок

        let message = `${inviterName} invites you to join CTMASS and adds you to category "${categoryTitle}". `;

        if (personalText) {
            // Ограничиваем длину личного сообщения для SMS
            const shortPersonalText = personalText.length > 100
                ? personalText.substring(0, 97) + '...'
                : personalText;
            message += `Message: "${shortPersonalText}" `;
        }

        message += `Register: ${shortLink}`;

        // SMS не должно превышать 1600 символов (обычно 160 для одной части)
        return message.length > 1600 ? message.substring(0, 1597) + '...' : message;
    }

    /**
     * Валидация номера телефона для США
     */
    validateUSPhoneNumber(phone) {
        // Формат: +1XXXXXXXXXX (ровно 12 символов с +1)
        const usPhoneRegex = /^\+1\d{10}$/;
        return usPhoneRegex.test(phone);
    }

    /**
     * Форматирование номера телефона
     */
    formatPhoneNumber(phone) {
        // Удаляем все нецифровые символы
        const cleaned = phone.replace(/\D/g, '');

        // Проверяем, что номер начинается с 1 (код США)
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return `+${cleaned}`;
        } else if (cleaned.length === 10) {
            // Если код страны не указан, добавляем +1
            return `+1${cleaned}`;
        }

        // Возвращаем как есть, если не удалось отформатировать
        return phone;
    }
}

export const smsService = new SMSService();