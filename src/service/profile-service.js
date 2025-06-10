import {ERROR, INFO} from "src/libs/log";

class ProfileService {
    updateRatingInfo = (profile, reviews) => {
        const methodName = "updateRatingInfo";
        try {

            profile.reviewCount = reviews?.length || 0;

            const totalSum = reviews?.reduce((sum, review) => sum + review.rating, 0) || 0;
            profile.rating = (totalSum === 0 && profile.reviewCount === 0) ? 0 : totalSum / profile.reviewCount;

            INFO(methodName, {"Request": [profile, reviews], "Response": {profile}});
            return profile;
        } catch (e) {
            ERROR(methodName, e);
        }
    }
}

export const profileService = new ProfileService();