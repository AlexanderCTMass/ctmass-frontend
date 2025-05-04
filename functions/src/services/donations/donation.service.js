import { db, FieldValue } from '../../shared/config/firebase.config.js'
import { DONATION_TIERS } from '../../shared/constants/donation.constants.js'

export class DonationService {
    static async updateDonationRank(userId, beforeData, afterData) {
        if (beforeData.totalDonations === afterData.totalDonations) return

        const newBadge = DONATION_TIERS.find(t => afterData.totalDonations >= t.amount)?.badge || 'New Donor'

        if (newBadge !== afterData.donationBadge) {
            await db.doc(`profiles/${userId}`).update({
                donationBadge: newBadge,
                isSupporter: afterData.totalDonations >= 10,
                lastUpdated: FieldValue.serverTimestamp()
            })
            console.log(`Updated rank for user ${userId} to ${newBadge}`)
        }
    }
}