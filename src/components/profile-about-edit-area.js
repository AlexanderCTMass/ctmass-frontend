import SmartTextArea from "src/components/smart-text-ares";
import * as React from "react";
import PropTypes from "prop-types";


/**
 * Генерирует персонализированные приветственные сообщения на основе профиля
 * @param {Object} profile - Данные профиля специалиста
 * @returns {string[]} - Массив из 10 вариантов текстов
 */
function generateWelcomeMessages(profile) {
    // Вспомогательная функция для безопасного получения значений
    const getValue = (obj, path, defaultValue = '') => {
        return path.split('.').reduce((res, key) => res?.[key] ?? defaultValue, obj);
    };

    // Извлекаем данные из профиля с резервными значениями
    const data = {
        businessName: profile.businessName || 'our team',
        location: getValue(profile, 'address.location.place_name', 'your area'),

        // Обрабатываем массив специализаций
        specialties: (profile.specialties || []).map(spec => ({
            label: spec.label || 'professional service',
            category: getValue(spec, 'category.label', 'expert services')
        })),

        // Обрабатываем массив образований
        educations: (profile.educations || []).map(edu => ({
            type: edu.certificateType || 'professional certification',
            org: edu.issuingOrganization || 'accredited institution',
            year: edu.year ? ` in ${edu.year}` : ''
        }))
    };

    // Форматируем списки для использования в тексте
    const specialtiesList = data.specialties.length > 0
        ? data.specialties.map(s => s.label).join(', ')
        : 'professional services';

    const lastSpecialty = data.specialties.length > 0
        ? data.specialties[data.specialties.length - 1].label
        : 'professional services';

    const educationList = data.educations.length > 0
        ? data.educations.map(e => `${e.type} from ${e.org}${e.year}`).join(', ')
        : 'professional training';

    const primaryCert = data.educations.length > 0
        ? data.educations[0].type
        : 'professional certification';

    const primaryOrg = data.educations.length > 0
        ? data.educations[0].org
        : 'accredited programs';

    // Шаблоны сообщений
    return [
        `Hey there! I'm ${data.businessName}, your local expert in ${specialtiesList} serving ${data.location}. With ${educationList}, I bring top-quality work to every project.\n\nWhat sets me apart? I listen carefully and deliver exactly what you need - no upsells, just honest service. Whether it's ${lastSpecialty} or any of my other services, you'll get professional results at fair prices.\n\nLet's discuss how I can help with your project!`,

        `Welcome to ${data.businessName}'s profile! Serving ${data.location} with specialized skills in ${specialtiesList}.\n\nMy background includes ${educationList}, ensuring your project meets the highest standards. I take pride in work that's:\n• Precise and durable\n• Completed on schedule\n• Fairly priced\n\nNo job too big or small. Contact me today for a free consultation!`,

        `Hi! I'm ${data.businessName}, a ${data.specialties[0]?.category || 'professional'} serving ${data.location}. My expertise covers ${specialtiesList}, backed by ${educationList}.\n\nWhy choose me?\n- Real-world experience with all types of projects\n- Clear communication every step of the way\n- Satisfaction guaranteed\n\nLet's turn your vision into reality - reach out anytime!`,

        `${data.businessName} here! Whether you need ${specialtiesList} in ${data.location}, I've got you covered. Certified through ${primaryOrg} with ${primaryCert}, I combine technical skills with practical know-how.\n\nYou'll appreciate:\n✓ Attention to detail\n✓ Reliable service\n✓ Competitive rates\n\nText or call to discuss your project - I'm happy to help!`,

        `Professional ${specialtiesList} services in ${data.location} - that's what I offer at ${data.businessName}. With qualifications including ${educationList}, I deliver results you can trust.\n\nClients choose me because:\n1. I show up on time\n2. My work stands the test of time\n3. I clean up when done\n\nGet in touch to schedule your service today!`,

        `Looking for quality ${data.specialties[0]?.category || 'services'} in ${data.location}? You've found the right pro! I'm ${data.businessName}, specializing in ${specialtiesList}.\n\nMy ${educationList} means your project is in capable hands. I promise:\n• No surprise fees\n• No cutting corners\n• No job left unfinished\n\nLet's get started - your satisfaction is my priority!`,

        `Hello ${data.location} residents! I'm ${data.businessName}, your local ${specialtiesList} expert. My ${primaryCert} from ${primaryOrg} ensures professional-grade results for your home or business.\n\nBenefits of working with me:\n- Fully insured\n- Detailed estimates\n- Flexible scheduling\n\nContact me today to see how I can help with your ${lastSpecialty} needs!`,

        `At ${data.businessName}, we provide exceptional ${specialtiesList} services throughout ${data.location}. Our team holds ${educationList}, bringing expertise to every job.\n\nWe're known for:\n✓ Quality craftsmanship\n✓ Transparent pricing\n✓ Respect for your property\n\nCall now to experience the difference professional service makes!`,

        `Trusted ${specialtiesList} services in ${data.location} - that's what ${data.businessName} delivers. With ${educationList}, I have the skills to handle projects of any complexity.\n\nYou'll love:\n• Free onsite estimates\n• Premium materials\n• Worry-free service\n\nDon't settle for less - contact me today!`,

        `${data.businessName} brings professional ${specialtiesList} to ${data.location} homes and businesses. My ${educationList} background means you get knowledgeable, reliable service.\n\nWhy clients recommend me:\n- Clear communication\n- Meticulous attention to detail\n- Commitment to excellence\n\nLet's discuss your project - I'm here to help!`
    ];
}

const generateFromProfile = (profile) => {
    const businessName = profile?.businessName || 'our company';
    const location = profile?.address?.location?.place_name || 'your area';
    const specialties = profile?.specialties?.map(s => s.label).join(', ') || 'various specialties';
    const educationList = profile?.education?.map(edu =>
        `${edu.certificateType} from ${edu.issuingOrganization} (${edu.year})`
    ).join(', ') || 'professional training';

    const variables = {
        businessName,
        location,
        specialties,
        education: educationList,
        certifications: educationList
    };

    const localTemplates = generateWelcomeMessages(profile);
    const template = localTemplates[Math.floor(Math.random() * localTemplates.length)];
    return template.replace(/\{(\w+)\}/g, (_, key) => variables[key] || key);
};

export const ProfileAboutEditArea = (props) => {
    const {
        profile, label = "About Your Business",
        initialValue,
        onTextChange, ...other
    } = props;

    return (
        <SmartTextArea
            label={label}
            initialValue={initialValue || generateFromProfile(profile)}
            onTextChange={onTextChange}
            placeholder="Describe your business..."
            generate={() => generateFromProfile(profile)}
        />
    )
}

ProfileAboutEditArea.propTypes = {
    profile: PropTypes.object.isRequired,
    initialValue: PropTypes.string,
    onTextChange: PropTypes.func,
}