import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { RouterLink } from 'src/components/router-link';
import { BackLink } from 'src/components/ctmass-ui';
import { BRAND, displayTitleSx } from 'src/theme/ctmass-tokens';
import { useAuth } from 'src/hooks/use-auth';
import { profileService } from 'src/service/profile-service';
import { paths } from 'src/paths';

// Компонент для отображения предупреждения о правах доступа
const PermissionAlert = ({ message }) => (
    <Alert severity="warning" sx={{ mb: 2 }}>
        {message}
    </Alert>
);

export const BlogHeader = ({
                               title = "Blog",
                               breadcrumbs = [],
                               action,
                               showGreeting = true,
                               greetingName = null,
                               showPermissionAlert = false,
                               permissionMessage = "You don't have permission to edit this post",
                               sx
                           }) => {
    const { user } = useAuth();
    const userName = greetingName || (user ? profileService.getUserName(user) : 'Admin');

    // Формируем хлебные крошки
    const defaultBreadcrumbs = [
        {
            label: 'Dashboard',
            href: paths.dashboard.overview
        },
        {
            label: 'Blog',
            href: paths.dashboard.blog.index
        }
    ];

    const allBreadcrumbs = [...defaultBreadcrumbs, ...breadcrumbs];

    const backItem = [...allBreadcrumbs].reverse().find((item, index) => index > 0 && item.href);

    return (
        <>
            {showPermissionAlert && <PermissionAlert message={permissionMessage} />}

            <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'stretch', md: 'flex-end' }}
                justifyContent="space-between"
                sx={{ gap: { xs: 2, md: 4 }, mb: { xs: 3, md: 4 }, ...sx }}
            >
                <Box sx={{ minWidth: 0 }}>
                    {backItem && <BackLink href={backItem.href}>{backItem.label}</BackLink>}
                    <Typography component="h1" sx={{ ...displayTitleSx, fontSize: { xs: 28, sm: 34, md: 40 }, overflowWrap: 'anywhere' }}>
                        {title}
                    </Typography>
                    {showGreeting && (
                        <Typography sx={{ mt: 1, color: BRAND.muted, fontSize: { xs: 15, md: 16 }, fontWeight: 500 }}>
                            Hi, {userName}. Share tips, finished projects and stories with the community.
                        </Typography>
                    )}
                </Box>
                {action && (
                    <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 1, flexShrink: 0 }}>
                        {action}
                    </Stack>
                )}
            </Stack>
        </>
    );
};

// Вспомогательная функция для проверки прав на редактирование
export const canEditPost = (post, user) => {
    if (!user || !post) return false;

    // Админ может редактировать все посты
    if (user.role === 'admin') return true;

    // Автор может редактировать свой пост
    return post.author?.id === user.id;
};

// Варианты действий для разных страниц
export const BlogHeaderActions = {
    // Для страницы создания
    Create: ({ onCancel, onSubmit, isSubmitting }) => (
        <>
            <Button
                color="inherit"
                onClick={onCancel}
                disabled={isSubmitting}
            >
                Cancel
            </Button>
            <Button
                variant="contained"
                onClick={onSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Publishing...' : 'Publish post'}
            </Button>
        </>
    ),

    // Для страницы деталей - с проверкой прав
    Details: ({ post, user, onDelete, onEdit }) => {
        const hasEditPermission = canEditPost(post, user);

        if (!hasEditPermission) {
            return (
                <Typography variant="body2" color="text.secondary">
                    Read only mode
                </Typography>
            );
        }

        return (
            <>
                <Button
                    variant="contained"
                    onClick={onEdit}
                >
                    Edit post
                </Button>
                <Button
                    color="error"
                    variant="outlined"
                    onClick={onDelete}
                >
                    Delete
                </Button>
            </>
        );
    },

    // Для страницы редактирования - с проверкой прав
    Edit: ({ post, user, onCancel, onSubmit, isSubmitting }) => {
        const hasEditPermission = canEditPost(post, user);

        if (!hasEditPermission) {
            return (
                <Button
                    color="inherit"
                    component={RouterLink}
                    href={paths.dashboard.blog.postDetails.replace(':postId', post?.id)}
                >
                    Back to post
                </Button>
            );
        }

        return (
            <>
                <Button
                    color="inherit"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save changes'}
                </Button>
            </>
        );
    },

    // Для страницы списка
    List: () => (
        <Button
            component={RouterLink}
            href={paths.dashboard.blog.postCreate}
            variant="contained"
        >
            New post
        </Button>
    )
};