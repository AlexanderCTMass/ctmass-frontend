import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp, runTransaction
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { profileService } from './profile-service';
import {firestore, storage} from "src/libs/firebase";

const BLOG_POSTS_COLLECTION = 'blogPosts';

class BlogService {
  // Получение всех постов с сортировкой по дате
  async getPosts(maxItems = 10) {
    try {
      const postsRef = collection(firestore, BLOG_POSTS_COLLECTION);
      const q = query(postsRef, orderBy('createdAt', 'desc'), limit(maxItems));
      const querySnapshot = await getDocs(q);

      const posts = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate() : data.publishedAt
        });
      });

      return posts;
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  }

  // Получение одного поста по ID
  async getPostById(postId) {
    try {
      const postRef = doc(firestore, BLOG_POSTS_COLLECTION, postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const data = postSnap.data();

        // Рекурсивно обрабатываем комментарии
        const processComments = (comments) => {
          if (!comments) return [];
          return comments.map(comment => ({
            ...comment,
            createdAt: comment.createdAt?.toDate ? comment.createdAt.toDate() : comment.createdAt,
            likedBy: comment.likedBy || [],
            likes: comment.likes || 0,
            replies: comment.replies ? processComments(comment.replies) : []
          }));
        };

        return {
          id: postSnap.id,
          ...data,
          likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
          likes: typeof data.likes === 'number' ? data.likes : 0,
          comments: processComments(data.comments || []),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate() : data.publishedAt
        };
      } else {
        throw new Error('Post not found');
      }
    } catch (error) {
      console.error('Error getting post:', error);
      throw error;
    }
  }

  // Создание нового поста
  async createPost(postData, user, coverFile = null) {
    try {
      let coverUrl = null;

      if (coverFile) {
        coverUrl = await this.uploadCoverImage(coverFile);
      }

      const content = postData.content || '';
      const authorName = profileService.getUserName(user);
      const authorAvatar = user.avatar || '/assets/avatars/avatar-default.png';

      const newPost = {
        title: postData.title,
        shortDescription: postData.shortDescription,
        content: content,
        category: postData.category || 'Uncategorized',
        seoTitle: postData.seoTitle || postData.title,
        seoDescription: postData.seoDescription || postData.shortDescription,
        cover: coverUrl,
        author: {
          id: user.id,
          name: authorName,
          avatar: authorAvatar,
          email: user.email
        },
        readTime: this.calculateReadTime(content),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
        status: 'published',
        likes: 0,
        likedBy: [],
        views: 0,
        comments: [],
        gallery: postData.gallery || []
      };

      const docRef = await addDoc(collection(firestore, BLOG_POSTS_COLLECTION), newPost);
      return { id: docRef.id, ...newPost };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }
  // Обновление поста
  async updatePost(postId, postData, user, coverFile = null, removeCover = false) {
    try {
      // Проверяем права перед обновлением
      const hasPermission = await this.checkEditPermission(postId, user.id);

      if (!hasPermission && user.role !== 'admin') {
        throw new Error('You do not have permission to edit this post');
      }

      const postRef = doc(firestore, BLOG_POSTS_COLLECTION, postId);
      const updateData = { ...postData, updatedAt: serverTimestamp() };

      // Удаляем старую обложку если нужно
      if (removeCover) {
        const oldPost = await this.getPostById(postId);
        if (oldPost.cover) {
          await this.deleteCoverImage(oldPost.cover);
        }
        updateData.cover = null;
      }

      // Загружаем новую обложку
      if (coverFile) {
        // Удаляем старую обложку
        const oldPost = await this.getPostById(postId);
        if (oldPost.cover) {
          await this.deleteCoverImage(oldPost.cover);
        }
        // Загружаем новую
        updateData.cover = await this.uploadCoverImage(coverFile);
      }

      if (postData.content) {
        updateData.readTime = this.calculateReadTime(postData.content);
      }

      await updateDoc(postRef, updateData);
      return await this.getPostById(postId);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  // Удаление поста
  async deletePost(postId, user) {
    try {
      // Проверяем права перед удалением
      const hasPermission = await this.checkEditPermission(postId, user.id);

      if (!hasPermission && user.role !== 'admin') {
        throw new Error('You do not have permission to delete this post');
      }

      const post = await this.getPostById(postId);

      if (post.cover) {
        await this.deleteCoverImage(post.cover);
      }

      await deleteDoc(doc(firestore, BLOG_POSTS_COLLECTION, postId));
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Загрузка обложки
  async uploadCoverImage(file) {
    try {
      const fileName = `blog-covers/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading cover:', error);
      throw error;
    }
  }

  // Удаление обложки
  async deleteCoverImage(coverUrl) {
    try {
      const coverRef = ref(storage, coverUrl);
      await deleteObject(coverRef);
    } catch (error) {
      console.error('Error deleting cover:', error);
    }
  }

  // Расчет времени чтения
  calculateReadTime(content) {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const textLength = content.split(/\s+/).length;
    const minutes = Math.ceil(textLength / wordsPerMinute);
    return `${minutes} min read`;
  }

  // Добавление комментария
  async addComment(postId, comment, user) {
    try {
      const postRef = doc(firestore, BLOG_POSTS_COLLECTION, postId);
      const post = await this.getPostById(postId);

      const newComment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        authorId: user.id,
        authorName: profileService.getUserName(user),
        authorAvatar: user.avatar || '/assets/avatars/avatar-default.png',
        content: comment,
        createdAt: new Date(),
        likes: 0,
        isLiked: false,
            likedBy: []
      };

      const comments = post.comments ? [...post.comments, newComment] : [newComment];
      await updateDoc(postRef, { comments });

      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async addReply(postId, parentCommentId, replyText, user) {
    try {
      const postRef = doc(firestore, BLOG_POSTS_COLLECTION, postId);
      const post = await this.getPostById(postId);

      const newReply = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        authorId: user.id,
        authorName: profileService.getUserName(user),
        authorAvatar: user.avatar || '/assets/avatars/avatar-default.png',
        content: replyText,
        createdAt: new Date(),
        likes: 0,
        likedBy: [],
        parentId: parentCommentId,
        replies: [] // Для дальнейших ответов
      };

      // Рекурсивная функция для добавления ответа
      const addReplyToComment = (comments, parentId, reply) => {
        return comments.map(comment => {
          if (comment.id === parentId) {
            // Нашли родительский комментарий
            return {
              ...comment,
              replies: [...(comment.replies || []), reply]
            };
          } else if (comment.replies && comment.replies.length > 0) {
            // Ищем в ответах
            return {
              ...comment,
              replies: addReplyToComment(comment.replies, parentId, reply)
            };
          }
          return comment;
        });
      };

      const updatedComments = addReplyToComment(post.comments || [], parentCommentId, newReply);

      await updateDoc(postRef, { comments: updatedComments });

      return newReply;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  }

  async toggleItemLike(postId, itemId, userId) {
    try {
      const postRef = doc(firestore, BLOG_POSTS_COLLECTION, postId);
      const post = await this.getPostById(postId);

      debugger;
      let updatedItem = null;

      // Рекурсивная функция для поиска и обновления элемента
      const updateItemLikes = (items) => {
        return items.map(item => {
          if (item.id === itemId) {
            // Нашли нужный элемент
            const likedBy = item.likedBy || [];
            const isLiked = likedBy.includes(userId);
            const newLikedBy = isLiked
                ? likedBy.filter(id => id !== userId)
                : [...likedBy, userId];
            const newLikes = isLiked ? Math.max(0, (item.likes || 0) - 1) : (item.likes || 0) + 1;

            updatedItem = {
              ...item,
              likes: newLikes,
              likedBy: newLikedBy,
              isLiked: !isLiked
            };

            return updatedItem;
          } else if (item.replies && item.replies.length > 0) {
            // Ищем в ответах
            return {
              ...item,
              replies: updateItemLikes(item.replies)
            };
          }
          return item;
        });
      };

      const updatedComments = updateItemLikes(post.comments || []);

      if (!updatedItem) {
        throw new Error('Item not found');
      }

      await updateDoc(postRef, { comments: updatedComments });

      return updatedItem;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  // Получение всех комментариев с древовидной структурой
  async getCommentTree(postId) {
    try {
      const post = await this.getPostById(postId);
      return post.comments || [];
    } catch (error) {
      console.error('Error getting comment tree:', error);
      return [];
    }
  }


  // Лайк/дизлайк поста
  async togglePostLike(postId, userId, isLiking) {
    try {
      const postRef = doc(firestore, BLOG_POSTS_COLLECTION, postId);

      // Используем transaction для атомарности
      const result = await runTransaction(firestore, async (transaction) => {
        const postDoc = await transaction.get(postRef);

        if (!postDoc.exists()) {
          throw new Error('Post not found');
        }

        const post = postDoc.data();

        // Безопасно получаем массивы
        const likedBy = Array.isArray(post.likedBy) ? [...post.likedBy] : [];
        const currentLikes = typeof post.likes === 'number' ? post.likes : 0;

        let newLikes = currentLikes;
        let newLikedBy = [...likedBy];

        if (isLiking) {
          // Добавляем лайк, если пользователь еще не лайкал
          if (!newLikedBy.includes(userId)) {
            newLikedBy.push(userId);
            newLikes = currentLikes + 1;
          }
        } else {
          // Убираем лайк, если пользователь лайкал
          const index = newLikedBy.indexOf(userId);
          if (index > -1) {
            newLikedBy.splice(index, 1);
            newLikes = Math.max(0, currentLikes - 1);
          }
        }

        // Обновляем только если были изменения
        if (newLikes !== currentLikes || JSON.stringify(newLikedBy) !== JSON.stringify(likedBy)) {
          transaction.update(postRef, {
            likes: newLikes,
            likedBy: newLikedBy,
            updatedAt: serverTimestamp()
          });
        }

        return {
          likes: newLikes,
          isLiked: newLikedBy.includes(userId),
          likedBy: newLikedBy
        };
      });

      return result;
    } catch (error) {
      console.error('Error toggling post like:', error);
      throw error;
    }
  }

// Получить статус лайка для пользователя
  async getPostLikeStatus(postId, userId) {
    try {
      if (!userId) return { likes: 0, isLiked: false };

      const post = await this.getPostById(postId);

      // Безопасно получаем значения
      const likes = typeof post.likes === 'number' ? post.likes : 0;
      const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
      const isLiked = likedBy.includes(userId);

      return { likes, isLiked };
    } catch (error) {
      console.error('Error getting like status:', error);
      return { likes: 0, isLiked: false };
    }
  }

  // Лайк комментария
  async toggleCommentLike(postId, commentId, userId) {
    try {
      const postRef = doc(firestore, BLOG_POSTS_COLLECTION, postId);
      const post = await this.getPostById(postId);
      
      const comments = post.comments.map(comment => {
        if (comment.id === commentId) {
          const likedBy = comment.likedBy || [];
          let likes = comment.likes || 0;
          
          if (likedBy.includes(userId)) {
            const index = likedBy.indexOf(userId);
            likedBy.splice(index, 1);
            likes--;
          } else {
            likedBy.push(userId);
            likes++;
          }
          
          return {
            ...comment,
            likes,
            likedBy,
            isLiked: likedBy.includes(userId)
          };
        }
        return comment;
      });

      await updateDoc(postRef, { comments });
      return comments.find(c => c.id === commentId);
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  }

  // Получение постов по категории
  async getPostsByCategory(category, maxItems = 10) {
    try {
      const postsRef = collection(firestore, BLOG_POSTS_COLLECTION);
      const q = query(
        postsRef, 
        where('category', '==', category),
        orderBy('createdAt', 'desc'), 
        limit(maxItems)
      );
      const querySnapshot = await getDocs(q);
      
      const posts = [];
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      
      return posts;
    } catch (error) {
      console.error('Error getting posts by category:', error);
      throw error;
    }
  }

  // Загрузка изображения для вставки в текст
  async uploadInlineImage(file) {
    try {
      const fileName = `blog-images/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, fileName);

      // Добавляем метаданные для оптимизации
      const metadata = {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
      };

      await uploadBytes(storageRef, file, metadata);
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error) {
      console.error('Error uploading inline image:', error);
      throw error;
    }
  }

// Загрузка галереи изображений
  async uploadGalleryImages(files) {
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `gallery/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          url,
          name: file.name,
          size: file.size,
          type: file.type
        };
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading gallery:', error);
      throw error;
    }
  }

// Удаление изображения
  async deleteImage(imageUrl) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Не выбрасываем ошибку, так как это не критично
    }
  }

  async checkEditPermission(postId, userId) {
    try {
      const post = await this.getPostById(postId);
      return post.author?.id === userId;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Добавление ответа на комментарий
  async addCommentReply(postId, commentId, replyText, user) {
    try {
      const postRef = doc(firestore, BLOG_POSTS_COLLECTION, postId);
      const post = await this.getPostById(postId);

      const newReply = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        authorId: user.id,
        authorName: profileService.getUserName(user),
        authorAvatar: user.avatar || '/assets/avatars/avatar-default.png',
        content: replyText,
        createdAt: new Date(),
        likes: 0,
        isLiked: false,
        likedBy: [],
        parentId: commentId // Ссылка на родительский комментарий
      };

      // Находим комментарий и добавляем к нему ответ
      const updatedComments = post.comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      });

      await updateDoc(postRef, { comments: updatedComments });

      return newReply;
    } catch (error) {
      console.error('Error adding comment reply:', error);
      throw error;
    }
  }

// Лайк ответа на комментарий
  async toggleReplyLike(postId, commentId, replyId, userId) {
    try {
      const postRef = doc(firestore, BLOG_POSTS_COLLECTION, postId);
      const post = await this.getPostById(postId);

      const updatedComments = post.comments.map(comment => {
        if (comment.id === commentId) {
          const updatedReplies = (comment.replies || []).map(reply => {
            if (reply.id === replyId) {
              const likedBy = reply.likedBy || [];
              const isLiked = likedBy.includes(userId);
              let newLikes = reply.likes || 0;
              let newLikedBy = [...likedBy];

              if (isLiked) {
                // Убираем лайк
                newLikedBy = likedBy.filter(id => id !== userId);
                newLikes = Math.max(0, (reply.likes || 0) - 1);
              } else {
                // Добавляем лайк
                newLikedBy = [...likedBy, userId];
                newLikes = (reply.likes || 0) + 1;
              }

              return {
                ...reply,
                likes: newLikes,
                likedBy: newLikedBy,
                isLiked: !isLiked
              };
            }
            return reply;
          });

          return {
            ...comment,
            replies: updatedReplies
          };
        }
        return comment;
      });

      await updateDoc(postRef, { comments: updatedComments });

      // Находим обновленный ответ
      for (const comment of updatedComments) {
        if (comment.id === commentId) {
          const updatedReply = (comment.replies || []).find(r => r.id === replyId);
          if (updatedReply) return updatedReply;
        }
      }

      throw new Error('Reply not found');
    } catch (error) {
      console.error('Error toggling reply like:', error);
      throw error;
    }
  }

// Получение всех ответов для комментария
  async getCommentReplies(postId, commentId) {
    try {
      const post = await this.getPostById(postId);
      const comment = post.comments?.find(c => c.id === commentId);
      return comment?.replies || [];
    } catch (error) {
      console.error('Error getting comment replies:', error);
      return [];
    }
  }
}

export const blogService = new BlogService();