import { httpsCallable } from 'firebase/functions';
import { functions } from 'src/libs/firebase';

const deleteUserAccountFn = httpsCallable(functions, 'deleteUserAccount', { timeout: 300000 });

export const deleteUserApi = {
  deleteAccount: async (userId, reason, reasonDetails) => {
    const result = await deleteUserAccountFn({ userId, reason, reasonDetails });
    return result.data;
  },
};
