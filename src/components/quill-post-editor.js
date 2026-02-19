import { useRef, useCallback, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    Box,
    CircularProgress,
    styled
} from '@mui/material';
import { blogService } from 'src/service/blog-service';

const QuillWrapper = styled(Box)(
    ({ theme, minHeight }) => ({
        '& .ql-container': {
            ...theme.typography.body1,
            fontFamily: theme.typography.fontFamily,
            fontSize: '1rem',
            minHeight: minHeight || 200,
            height: 'auto !important', // Важно для автоматической высоты
            '& .ql-editor': {
                minHeight: minHeight || 200,
                height: 'auto',
                overflowY: 'auto',
                '&.ql-blank::before': {
                    color: theme.palette.text.disabled,
                    fontStyle: 'normal',
                    left: 0,
                    right: 0
                }
            }
        },
        '& .ql-toolbar': {
            backgroundColor: theme.palette.action.hover,
            borderColor: theme.palette.divider,
            borderTopLeftRadius: theme.shape.borderRadius,
            borderTopRightRadius: theme.shape.borderRadius,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            '& .ql-picker-label': {
                color: theme.palette.text.primary
            },
            '& .ql-stroke': {
                stroke: theme.palette.text.primary
            },
            '& .ql-fill': {
                fill: theme.palette.text.primary
            }
        }
    })
);

// Кастомный модуль для загрузки изображений
const getModules = (handleImageUpload) => ({
    toolbar: {
        container: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ align: [] }],
            ['link', 'image', 'video'],
            ['clean']
        ],
        handlers: {
            image: handleImageUpload
        }
    },
    clipboard: {
        matchVisual: false
    }
});

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image', 'video'
];

export const QuillEditor = (props) => {
    const {
        value,
        onChange,
        placeholder,
        sx,
        disabled,
        onImageUploadStart,
        onImageUploadEnd,
        minHeight = 200, // Добавляем пропс для минимальной высоты
        autoFocus = false
    } = props;

    const quillRef = useRef(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [editorHeight, setEditorHeight] = useState(minHeight);

    // Эффект для обновления высоты при изменении контента
    useEffect(() => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            if (editor) {
                const root = editor.root;
                if (root) {
                    // Обновляем высоту на основе содержимого
                    const updateHeight = () => {
                        const scrollHeight = root.scrollHeight;
                        setEditorHeight(Math.max(minHeight, scrollHeight));
                    };

                    // Наблюдаем за изменениями в редакторе
                    const observer = new MutationObserver(updateHeight);
                    observer.observe(root, {
                        childList: true,
                        subtree: true,
                        characterData: true
                    });

                    // Начальное обновление
                    updateHeight();

                    return () => observer.disconnect();
                }
            }
        }
    }, [minHeight]);

    const handleImageUpload = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.setAttribute('multiple', 'false');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            try {
                setUploadingImage(true);
                onImageUploadStart?.();

                const imageUrl = await blogService.uploadInlineImage(file);
                const quill = quillRef.current?.getEditor();
                if (!quill) return;

                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', imageUrl);
                quill.setSelection(range.index + 1);

                onImageUploadEnd?.(true);
            } catch (error) {
                console.error('Error uploading image:', error);
                onImageUploadEnd?.(false);
            } finally {
                setUploadingImage(false);
            }
        };
    }, [onImageUploadStart, onImageUploadEnd]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                uploadImage(file);
            }
        }
    }, []);

    const uploadImage = async (file) => {
        try {
            setUploadingImage(true);
            onImageUploadStart?.();
            const imageUrl = await blogService.uploadInlineImage(file);

            const quill = quillRef.current?.getEditor();
            if (!quill) return;

            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', imageUrl);
            quill.setSelection(range.index + 1);

            onImageUploadEnd?.(true);
        } catch (error) {
            console.error('Error uploading image:', error);
            onImageUploadEnd?.(false);
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <Box sx={{ position: 'relative', width: '100%' }}>
            {uploadingImage && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        borderRadius: 1
                    }}
                >
                    <CircularProgress size={40}/>
                </Box>
            )}
            <QuillWrapper
                sx={{
                    ...sx,
                    height: 'auto',
                    '& .ql-container': {
                        height: `${editorHeight}px !important`
                    }
                }}
                minHeight={minHeight}
            >
                <ReactQuill
                    ref={quillRef}
                    value={value}
                    onChange={onChange}
                    modules={getModules(handleImageUpload)}
                    formats={formats}
                    placeholder={placeholder}
                    readOnly={disabled}
                    theme="snow"
                    onDrop={handleDrop}
                    autoFocus={autoFocus}
                />
            </QuillWrapper>
        </Box>
    );
};