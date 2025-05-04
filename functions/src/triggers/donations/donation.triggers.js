import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { DonationService } from '../../services/donations/donation.service.js'

export const updateDonationRank = onDocumentUpdated(
    { document: 'profiles/{userId}', memory: '512MiB' },
    async (event) => {
        try {
            const beforeData = event.data?.before?.data()
            const afterData = event.data?.after?.data()

            if (!beforeData || !afterData) {
                console.log('No document data available')
                return
            }

            await DonationService.updateDonationRank(event.params.userId, beforeData, afterData)
        } catch (error) {
            console.error('Error updating donation rank:', error)
            throw error
        }
    }
)