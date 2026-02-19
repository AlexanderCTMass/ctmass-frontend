import { Typography, Card, Stack, Button, Breadcrumbs, Link, Alert } from '@mui/material';
import { RouterLink } from 'src/components/router-link';
import { BreadcrumbsSeparator } from 'src/components/breadcrumbs-separator';
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

    return (
        <>
            {showPermissionAlert && <PermissionAlert message={permissionMessage} />}

            <Stack spacing={1} sx={sx}>
                <Typography variant="h3">
                    {title}
                </Typography>
                <Breadcrumbs separator={<BreadcrumbsSeparator />}>
                    {allBreadcrumbs.map((item, index) => {
                        const isLast = index === allBreadcrumbs.length - 1;

                        if (isLast || !item.href) {
                            return (
                                <Typography
                                    key={item.label}
                                    color="text.secondary"
                                    variant="subtitle2"
                                >
                                    {item.label}
                                </Typography>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                color="text.primary"
                                component={RouterLink}
                                href={item.href}
                                variant="subtitle2"
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </Breadcrumbs>
            </Stack>

            <Card
                elevation={16}
                sx={{
                    alignItems: 'center',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 8,
                    mt: 6,
                    px: 3,
                    py: 2,
                    ...sx
                }}
            >
                {showGreeting && (
                    <Typography variant="subtitle1">
                        Hello, {userName}
                    </Typography>
                )}

                {action && (
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={2}
                    >
                        {action}
                    </Stack>
                )}
            </Card>
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
                    Edit Post
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
                    Back to Post
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
            New Post
        </Button>
    )
};