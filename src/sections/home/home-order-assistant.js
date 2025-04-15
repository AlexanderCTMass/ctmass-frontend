import React, {useState, useEffect, useRef} from 'react';
import {
    Box,
    TextField,
    Button,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
    Chip,
    IconButton,
    CircularProgress
} from '@mui/material';
import {Send, PhotoCamera, Videocam, DateRange} from '@mui/icons-material';
import {collection, addDoc, query, where, getDocs} from 'firebase/firestore';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import {v4 as uuidv4} from 'uuid';
import {firestore, storage} from "src/libs/firebase";

const OrderAssistant = ({user, onComplete}) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState('welcome');
    const [orderData, setOrderData] = useState({
        title: '',
        category: '',
        urgency: '',
        description: '',
        media: [],
        budget: '',
        address: '',
        contact: user ? {phone: user.phone, email: user.email} : {}
    });
    const [suggestedCategories, setSuggestedCategories] = useState([]);
    const messagesEndRef = useRef(null);

    // Прокрутка к последнему сообщению
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    // Начальное сообщение
    useEffect(() => {
        setMessages([{
            id: 1,
            text: 'Привет! Я помогу вам создать заказ на строительную или ремонтную услугу. Давайте начнем. Опишите, что нужно сделать?',
            sender: 'bot'
        }]);
    }, []);

    // Обработка отправки сообщения
    const handleSend = async () => {
        if (!input.trim()) return;

        // Добавляем сообщение пользователя
        const userMessage = {id: Date.now(), text: input, sender: 'user'};
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        // Обрабатываем ввод в зависимости от текущего состояния
        try {
            switch (state) {
                case 'welcome':
                    await processTaskDescription(input);
                    break;
                case 'category':
                    await processCategorySelection(input);
                    break;
                case 'urgency':
                    await processUrgency(input);
                    break;
                case 'details':
                    await processAdditionalDetails(input);
                    break;
                case 'budget':
                    await processBudget(input);
                    break;
                case 'address':
                    await processAddress(input);
                    break;
                case 'contact':
                    await processContactInfo(input);
                    break;
                default:
                    await processDefault(input);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Произошла ошибка. Пожалуйста, попробуйте еще раз.',
                sender: 'bot'
            }]);
        } finally {
            setLoading(false);
        }
    };

    // Обработка описания задачи
    const processTaskDescription = async (text) => {
        setOrderData(prev => ({...prev, title: text}));

        // Попробуем определить категорию автоматически
        const categories = await suggestCategories(text);

        if (categories.length > 0) {
            setSuggestedCategories(categories);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Я думаю, это может быть одна из этих категорий:',
                sender: 'bot',
                categories: categories
            }, {
                id: Date.now() + 1,
                text: 'Выберите подходящую категорию или уточните задачу, если ни одна не подходит.',
                sender: 'bot'
            }]);
            setState('category');
        } else {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Пожалуйста, укажите специальность или категорию работ (например, "сантехник", "электрик", "отделочные работы").',
                sender: 'bot'
            }]);
            setState('category');
        }
    };

    // Подбор категорий на основе описания
    const suggestCategories = async (text) => {
        try {
            // Здесь можно добавить вызов облачной функции Firebase для анализа текста
            // или использовать простой поиск по ключевым словам

            // Временная реализация - поиск по ключевым словам в Firestore
            const categoriesRef = collection(firestore, 'categories');
            const q = query(categoriesRef, where('keywords', 'array-contains-any', text.toLowerCase().split(' ')));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
                description: doc.data().description
            }));
        } catch (error) {
            console.error('Error suggesting categories:', error);
            return [];
        }
    };

    // Обработка выбора категории
    const processCategorySelection = async (text) => {
        // Проверяем, выбрал ли пользователь одну из предложенных категорий
        const selectedCategory = suggestedCategories.find(cat =>
            cat.name.toLowerCase() === text.toLowerCase() ||
            text.toLowerCase().includes(cat.name.toLowerCase())
        );

        if (selectedCategory) {
            setOrderData(prev => ({...prev, category: selectedCategory.id}));
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: `Отлично, категория "${selectedCategory.name}" выбрана. Когда нужно выполнить работу? (например, "как можно скорее", "на следующей неделе" или конкретная дата)`,
                sender: 'bot'
            }]);
            setState('urgency');
        } else {
            // Если категория не распознана, сохраняем как текст и просим уточнить дату
            setOrderData(prev => ({...prev, category: text}));
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: `Принято, категория "${text}". Когда нужно выполнить работу? (например, "как можно скорее", "на следующей неделе" или конкретная дата)`,
                sender: 'bot'
            }]);
            setState('urgency');
        }
    };

    // Обработка срочности
    const processUrgency = (text) => {
        setOrderData(prev => ({...prev, urgency: text}));
        setMessages(prev => [...prev, {
            id: Date.now(),
            text: 'Хотите добавить более подробное описание задачи или прикрепить фото/видео? (это не обязательно, но поможет специалистам лучше понять задачу)',
            sender: 'bot'
        }]);
        setState('details');
    };

    // Обработка дополнительных деталей
    const processAdditionalDetails = (text) => {
        if (text.toLowerCase().includes('нет') || text.toLowerCase().includes('пропустить')) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Есть ли у вас предпочтительный бюджет на выполнение работы? (например, "до 10000 руб", "по договоренности")',
                sender: 'bot'
            }]);
            setState('budget');
        } else {
            setOrderData(prev => ({...prev, description: text}));
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Описание сохранено. Вы можете прикрепить фото/видео, если нужно. Есть ли у вас предпочтительный бюджет на выполнение работы?',
                sender: 'bot'
            }]);
            setState('budget');
        }
    };

    // Обработка бюджета
    const processBudget = (text) => {
        setOrderData(prev => ({...prev, budget: text}));

        if (user && user.address) {
            setOrderData(prev => ({...prev, address: user.address}));
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: `Ваш адрес: ${user.address}. Все верно или нужно указать другой?`,
                sender: 'bot'
            }]);
            setState('address');
        } else {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Пожалуйста, укажите адрес, где нужно выполнить работу.',
                sender: 'bot'
            }]);
            setState('address');
        }
    };

    // Обработка адреса
    const processAddress = (text) => {
        if (text.toLowerCase().includes('верно') || text.toLowerCase().includes('да')) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Проверьте ваши контактные данные для связи:',
                sender: 'bot'
            }, {
                id: Date.now() + 1,
                text: `Телефон: ${orderData.contact.phone || 'не указан'}\nEmail: ${orderData.contact.email || 'не указан'}`,
                sender: 'bot'
            }, {
                id: Date.now() + 2,
                text: 'Все верно или нужно что-то изменить?',
                sender: 'bot'
            }]);
            setState('contact');
        } else {
            setOrderData(prev => ({...prev, address: text}));
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Адрес сохранен. Проверьте ваши контактные данные для связи:',
                sender: 'bot'
            }, {
                id: Date.now() + 1,
                text: `Телефон: ${orderData.contact.phone || 'не указан'}\nEmail: ${orderData.contact.email || 'не указан'}`,
                sender: 'bot'
            }, {
                id: Date.now() + 2,
                text: 'Все верно или нужно что-то изменить?',
                sender: 'bot'
            }]);
            setState('contact');
        }
    };

    const processDefault = async (text) => {
    }

    // Обработка контактной информации
    const processContactInfo = async (text) => {
        if (text.toLowerCase().includes('верно') || text.toLowerCase().includes('да')) {
            // Завершаем процесс
            await completeOrder();
        } else {
            // Просим уточнить контакты
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Пожалуйста, укажите ваш телефон и/или email через запятую (например, "89161234567, my@email.com")',
                sender: 'bot'
            }]);
            setState('contact_update');
        }
    };

    // Обновление контактной информации
    const processContactUpdate = async (text) => {
        const parts = text.split(',').map(part => part.trim());
        const phone = parts.find(part => part.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im));
        const email = parts.find(part => part.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));

        setOrderData(prev => ({
            ...prev,
            contact: {
                phone: phone || prev.contact.phone,
                email: email || prev.contact.email
            }
        }));

        await completeOrder();
    };

    // Завершение создания заказа
    const completeOrder = async () => {
        try {
            setLoading(true);

            // Сохраняем заказ в Firestore
            const orderRef = collection(firestore, 'orders');
            const docRef = await addDoc(orderRef, {
                ...orderData,
                createdAt: new Date(),
                userId: user?.uid || null,
                status: 'new'
            });

            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Отлично! Ваш заказ создан. Специалисты смогут увидеть его и откликнуться. Хотите посмотреть созданный заказ?',
                sender: 'bot',
                orderId: docRef.id
            }]);

            if (onComplete) {
                onComplete(docRef.id);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Произошла ошибка при создании заказа. Пожалуйста, попробуйте еще раз.',
                sender: 'bot'
            }]);
        } finally {
            setLoading(false);
            setState('complete');
        }
    };

    // Загрузка медиафайлов
    const handleMediaUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileId = uuidv4();
        const fileRef = ref(storage, `order_media/${fileId}`);

        try {
            setLoading(true);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);

            setOrderData(prev => ({
                ...prev,
                media: [...prev.media, {type, url}]
            }));

            setMessages(prev => [...prev, {
                id: Date.now(),
                text: `Файл ${type === 'photo' ? 'фото' : 'видео'} успешно загружен.`,
                sender: 'bot',
                media: {type, url}
            }]);
        } catch (error) {
            console.error('Error uploading file:', error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: 'Ошибка при загрузке файла. Пожалуйста, попробуйте еще раз.',
                sender: 'bot'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden'
        }}>
            {/* Заголовок чата */}
            <Box sx={{
                p: 2,
                bgcolor: 'primary.main',
                color: 'white',
                textAlign: 'center'
            }}>
                <Typography variant="h6">Помощник по созданию заказа</Typography>
            </Box>

            {/* История сообщений */}
            <Box sx={{
                flex: 1,
                p: 2,
                overflowY: 'auto',
                bgcolor: '#f9f9f9'
            }}>
                <List>
                    {messages.map((message) => (
                        <ListItem
                            key={message.id}
                            sx={{
                                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                                alignItems: 'flex-start',
                                my: 1
                            }}
                        >
                            <ListItemAvatar sx={{minWidth: '40px'}}>
                                <Avatar sx={{
                                    bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                                    width: 32,
                                    height: 32
                                }}>
                                    {message.sender === 'user' ? 'Я' : 'Б'}
                                </Avatar>
                            </ListItemAvatar>
                            <Box sx={{
                                maxWidth: '80%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <ListItemText
                                    primary={message.text}
                                    sx={{
                                        bgcolor: message.sender === 'user' ? 'primary.light' : 'background.paper',
                                        color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                                        p: 1.5,
                                        borderRadius: message.sender === 'user' ?
                                            '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        boxShadow: 1,
                                        wordBreak: 'break-word'
                                    }}
                                />
                                {message.categories && (
                                    <Box sx={{mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                        {message.categories.map(cat => (
                                            <Chip
                                                key={cat.id}
                                                label={cat.name}
                                                onClick={() => {
                                                    setInput(cat.name);
                                                    handleSend();
                                                }}
                                                sx={{cursor: 'pointer'}}
                                            />
                                        ))}
                                    </Box>
                                )}
                                {message.media && (
                                    <Box sx={{mt: 1}}>
                                        {message.media.type === 'photo' ? (
                                            <img
                                                src={message.media.url}
                                                alt="Прикрепленное фото"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '200px',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        ) : (
                                            <video
                                                src={message.media.url}
                                                controls
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '200px',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </ListItem>
                    ))}
                    {loading && (
                        <ListItem sx={{justifyContent: 'flex-start'}}>
                            <ListItemAvatar>
                                <Avatar sx={{bgcolor: 'secondary.main', width: 32, height: 32}}>Б</Avatar>
                            </ListItemAvatar>
                            <CircularProgress size={24}/>
                        </ListItem>
                    )}
                    <div ref={messagesEndRef}/>
                </List>
            </Box>

            {/* Поле ввода и кнопки */}
            <Box sx={{
                p: 2,
                borderTop: '1px solid #e0e0e0',
                bgcolor: 'background.paper'
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                    <IconButton color="primary" component="label">
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => handleMediaUpload(e, 'photo')}
                        />
                        <PhotoCamera/>
                    </IconButton>
                    <IconButton color="primary" component="label">
                        <input
                            type="file"
                            accept="video/*"
                            hidden
                            onChange={(e) => handleMediaUpload(e, 'video')}
                        />
                        <Videocam/>
                    </IconButton>
                </Box>
                <Box sx={{display: 'flex', gap: 1}}>
                    <TextField
                        fullWidth
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Введите сообщение..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={loading}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                    >
                        <Send/>
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default OrderAssistant;