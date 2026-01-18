export const humanizeSocialGroupValue = (value) => {
    if (!value) {
        return '';
    }

    return String(value)
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const SOCIAL_GROUP_SECTIONS = [
    {
        title: 'Company & Leadership',
        options: [
            {
                value: 'ownerFounder',
                label: 'Owner / Founder',
                icon: '👑',
                description: 'Leads the overall vision, direction, and ownership of the company.'
            },
            {
                value: 'managingDirector',
                label: 'Managing Director',
                icon: '📊',
                description: 'Oversees strategic planning, teams, and daily business performance.'
            },
            {
                value: 'companyPrincipal',
                label: 'Company Principal',
                icon: '🏢',
                description: 'Primary executive guiding client relationships and firm growth.'
            },
            {
                value: 'operationsManager',
                label: 'Operations Manager',
                icon: '🛠️',
                description: 'Runs internal operations, people, and processes across the organization.'
            }
        ]
    },
    {
        title: 'Project & Construction Management',
        options: [
            {
                value: 'constructionManager',
                label: 'Construction Manager',
                icon: '🏗️',
                description: 'Coordinates construction teams, schedules, budgets, and project resources.'
            },
            {
                value: 'projectManager',
                label: 'Project Manager',
                icon: '📋',
                description: 'Owns project delivery, scope, budget, and client communication.'
            },
            {
                value: 'assistantProjectManager',
                label: 'Assistant Project Manager',
                icon: '🧾',
                description: 'Supports project leadership with coordination, documentation, and follow-up.'
            },
            {
                value: 'siteSuperintendent',
                label: 'Site Superintendent',
                icon: '🧰',
                description: 'Manages jobsite safety, scheduling, and subcontractor coordination.'
            },
            {
                value: 'constructionSupervisor',
                label: 'Construction Supervisor (CSL)',
                icon: '🛡️',
                description: 'Ensures field crews follow plans, codes, and quality standards.'
            },
            {
                value: 'foremanLeadTechnician',
                label: 'Foreman / Lead Technician',
                icon: '👷‍♂️',
                description: 'Hands-on leader directing technicians and day-to-day crew tasks.'
            }
        ]
    },
    {
        title: 'Engineering & Technical Professionals',
        options: [
            {
                value: 'fieldEngineer',
                label: 'Field Engineer',
                icon: '🧭',
                description: 'Provides on-site engineering support and technical troubleshooting.'
            },
            {
                value: 'mechanicalEngineer',
                label: 'Mechanical Engineer',
                icon: '⚙️',
                description: 'Designs and optimizes mechanical systems for building projects.'
            },
            {
                value: 'electricalEngineer',
                label: 'Electrical Engineer',
                icon: '💡',
                description: 'Plans and reviews electrical power, lighting, and distribution systems.'
            },
            {
                value: 'hvacEngineer',
                label: 'HVAC Engineer',
                icon: '❄️',
                description: 'Specializes in HVAC system design, sizing, and performance.'
            },
            {
                value: 'buildingSystemsEngineer',
                label: 'Building Systems Engineer',
                icon: '🏢',
                description: 'Integrates building systems for reliability, safety, and efficiency.'
            },
            {
                value: 'controlsAutomationEngineer',
                label: 'Controls / Automation Engineer',
                icon: '🤖',
                description: 'Develops automated controls for building and industrial systems.'
            },
            {
                value: 'commissioningEngineer',
                label: 'Commissioning Engineer',
                icon: '✅',
                description: 'Verifies system performance during commissioning and turnover.'
            }
        ]
    },
    {
        title: 'Licensed Trades',
        options: [
            {
                value: 'hvacMechanical',
                label: 'HVAC & Mechanical',
                icon: '🌬️',
                description: 'Delivers HVAC and mechanical system installation and service.'
            },
            {
                value: 'hvacTechnician',
                label: 'HVAC Technician',
                icon: '🛠️',
                description: 'Installs, repairs, and maintains HVAC equipment in the field.'
            },
            {
                value: 'hvacInstaller',
                label: 'HVAC Installer',
                icon: '🔧',
                description: 'Performs HVAC equipment, ductwork, and system installation.'
            },
            {
                value: 'refrigerationTechnician',
                label: 'Refrigeration Technician',
                icon: '🧊',
                description: 'Services commercial refrigeration and cooling equipment.'
            },
            {
                value: 'boilerTechnician',
                label: 'Boiler Technician',
                icon: '🔥',
                description: 'Maintains and repairs boiler and hydronic heating systems.'
            },
            {
                value: 'sheetMetalMechanic',
                label: 'Sheet Metal Mechanic',
                icon: '🔩',
                description: 'Fabricates and installs sheet metal ductwork and assemblies.'
            },
            {
                value: 'controlsTechnician',
                label: 'Controls Technician',
                icon: '🎛️',
                description: 'Programs and maintains control systems and field devices.'
            }
        ]
    },
    {
        title: 'Electrical',
        options: [
            {
                value: 'electricianJourneymanMaster',
                label: 'Electrician (Journeyman / Master)',
                icon: '⚡',
                description: 'Licensed electrician with advanced installation and troubleshooting expertise.'
            },
            {
                value: 'lowVoltageTechnician',
                label: 'Low Voltage Technician',
                icon: '🔌',
                description: 'Installs low-voltage systems for data, security, and communications.'
            },
            {
                value: 'fireAlarmTechnician',
                label: 'Fire Alarm Technician',
                icon: '🚨',
                description: 'Installs and services fire alarm and life-safety systems.'
            },
            {
                value: 'solarTechnician',
                label: 'Solar Technician',
                icon: '☀️',
                description: 'Builds and maintains solar panel and renewable energy systems.'
            },
            {
                value: 'plumbingPiping',
                label: 'Plumbing & Piping',
                icon: '🚰',
                description: 'Provides plumbing, piping, and fluid handling services.'
            },
            {
                value: 'plumberJourneymanMaster',
                label: 'Plumber (Journeyman / Master)',
                icon: '🔧',
                description: 'Licensed plumber specializing in complex installs and service.'
            },
            {
                value: 'pipefitter',
                label: 'Pipefitter',
                icon: '🛠️',
                description: 'Installs and maintains pipe systems for HVAC, process, or utilities.'
            },
            {
                value: 'steamfitter',
                label: 'Steamfitter',
                icon: '♨️',
                description: 'Constructs and services steam and hot-water distribution systems.'
            },
            {
                value: 'gasFitter',
                label: 'Gas Fitter',
                icon: '🔥',
                description: 'Installs and tests natural gas piping, regulators, and appliances.'
            }
        ]
    },
    {
        title: 'General Construction',
        options: [
            {
                value: 'carpenter',
                label: 'Carpenter',
                icon: '🪚',
                description: 'Constructs and repairs structural and finish carpentry elements.'
            },
            {
                value: 'finishCarpenter',
                label: 'Finish Carpenter',
                icon: '🪵',
                description: 'Delivers detailed interior trim and fine carpentry work.'
            },
            {
                value: 'framer',
                label: 'Framer',
                icon: '📐',
                description: 'Builds structural framing for residential and commercial projects.'
            },
            {
                value: 'drywallInstaller',
                label: 'Drywall Installer',
                icon: '🧱',
                description: 'Installs drywall assemblies and prepares surfaces for finishing.'
            },
            {
                value: 'masonBricklayer',
                label: 'Mason / Bricklayer',
                icon: '🧱',
                description: 'Builds masonry walls, veneers, and structural elements.'
            },
            {
                value: 'concreteFinisher',
                label: 'Concrete Finisher',
                icon: '🪨',
                description: 'Places, finishes, and repairs concrete slabs and structures.'
            },
            {
                value: 'roofer',
                label: 'Roofer',
                icon: '🏠',
                description: 'Installs and maintains roofing systems and waterproofing.'
            }
        ]
    },
    {
        title: 'Specialty Trades & Systems',
        options: [
            {
                value: 'buildingAutomationSpecialist',
                label: 'Building Automation Specialist',
                icon: '🕹️',
                description: 'Integrates and optimizes building automation platforms and devices.'
            },
            {
                value: 'fireProtectionTechnician',
                label: 'Fire Protection Technician',
                icon: '🧯',
                description: 'Installs and services sprinkler and fire suppression systems.'
            },
            {
                value: 'securitySystemsTechnician',
                label: 'Security Systems Technician',
                icon: '🔒',
                description: 'Implements and maintains security and surveillance solutions.'
            },
            {
                value: 'accessControlTechnician',
                label: 'Access Control Technician',
                icon: '🛑',
                description: 'Configures access control, credentialing, and door hardware solutions.'
            },
            {
                value: 'audioVisualTechnician',
                label: 'Audio / Visual Technician',
                icon: '🎛️',
                description: 'Sets up A/V, conferencing, and sound reinforcement systems.'
            },
            {
                value: 'insulationTechnician',
                label: 'Insulation Technician',
                icon: '🧤',
                description: 'Applies thermal and acoustic insulation materials.'
            },
            {
                value: 'waterproofingSpecialist',
                label: 'Waterproofing Specialist',
                icon: '💧',
                description: 'Protects structures from moisture intrusion and water damage.'
            }
        ]
    },
    {
        title: 'Service, Maintenance & Facilities',
        options: [
            {
                value: 'maintenanceTechnician',
                label: 'Maintenance Technician',
                icon: '🧰',
                description: 'Provides routine maintenance, troubleshooting, and repairs across facilities.'
            },
            {
                value: 'buildingEngineer',
                label: 'Building Engineer',
                icon: '🏢',
                description: 'Oversees building systems performance and preventive maintenance.'
            },
            {
                value: 'facilitiesTechnician',
                label: 'Facilities Technician',
                icon: '🏗️',
                description: 'Supports facility operations, repairs, and occupant comfort.'
            },
            {
                value: 'serviceTechnician',
                label: 'Service Technician',
                icon: '🛎️',
                description: 'Responds to service calls and resolves equipment issues.'
            },
            {
                value: 'preventiveMaintenanceTechnician',
                label: 'Preventive Maintenance Technician',
                icon: '🔄',
                description: 'Performs scheduled maintenance to prevent downtime and failures.'
            },
            {
                value: 'emergencyRepairTechnician',
                label: 'Emergency Repair Technician',
                icon: '🚑',
                description: 'Handles urgent repairs and after-hours service needs.'
            }
        ]
    },
    {
        title: 'Estimating, Sales & Procurement',
        options: [
            {
                value: 'estimator',
                label: 'Estimator',
                icon: '📊',
                description: 'Prepares cost estimates, takeoffs, and bid proposals.'
            },
            {
                value: 'salesEngineer',
                label: 'Sales Engineer',
                icon: '🛒',
                description: 'Combines technical expertise with sales support for clients.'
            },
            {
                value: 'projectSalesManager',
                label: 'Project Sales Manager',
                icon: '🤝',
                description: 'Leads project pursuits, proposals, and client relationships.'
            },
            {
                value: 'businessDevelopmentManager',
                label: 'Business Development Manager',
                icon: '📈',
                description: 'Drives new business, partnerships, and market outreach.'
            },
            {
                value: 'purchasingSpecialist',
                label: 'Purchasing / Procurement Specialist',
                icon: '🧾',
                description: 'Procures materials, equipment, and vendor services for projects.'
            }
        ]
    },
    {
        title: 'Safety, Quality & Compliance',
        options: [
            {
                value: 'safetyManager',
                label: 'Safety Manager',
                icon: '🦺',
                description: 'Leads safety programs, training, and compliance initiatives.'
            },
            {
                value: 'siteSafetyOfficer',
                label: 'Site Safety Officer',
                icon: '🚧',
                description: 'Monitors jobsite safety and enforces procedures daily.'
            },
            {
                value: 'oshaComplianceSpecialist',
                label: 'OSHA Compliance Specialist',
                icon: '📋',
                description: 'Ensures OSHA standards, reporting, and mitigation plans are met.'
            },
            {
                value: 'qualityControlManager',
                label: 'Quality Control Manager',
                icon: '✅',
                description: 'Oversees quality assurance plans, inspections, and documentation.'
            },
            {
                value: 'tradeInspector',
                label: 'Trade Inspector',
                icon: '🔍',
                description: 'Inspects work for code compliance and quality benchmarks.'
            }
        ]
    },
    {
        title: 'Administrative & Support',
        options: [
            {
                value: 'officeManager',
                label: 'Office Manager',
                icon: '🗂️',
                description: 'Runs office operations, administration, and team support.'
            },
            {
                value: 'projectAdministrator',
                label: 'Project Administrator',
                icon: '📝',
                description: 'Handles project documentation, logs, and communication.'
            },
            {
                value: 'schedulerPlanner',
                label: 'Scheduler / Planner',
                icon: '🗓️',
                description: 'Builds and tracks construction schedules and resources.'
            },
            {
                value: 'accountingPayrollSpecialist',
                label: 'Accounting & Payroll Specialist',
                icon: '💵',
                description: 'Manages accounting, billing, and payroll functions.'
            },
            {
                value: 'contractAdministrator',
                label: 'Contract Administrator',
                icon: '📄',
                description: 'Prepares contracts, change orders, and compliance paperwork.'
            }
        ]
    },
    {
        title: 'Entry-Level & Workforce Development',
        options: [
            {
                value: 'entryApprentice',
                label: 'Apprentice',
                icon: '🧑‍🏭',
                description: 'Entry-level apprentice gaining trade skills and mentorship.'
            },
            {
                value: 'helperLaborer',
                label: 'Helper / Laborer',
                icon: '🧰',
                description: 'Provides general labor support across job sites.'
            },
            {
                value: 'juniorTechnician',
                label: 'Junior Technician',
                icon: '🔧',
                description: 'Developing technician supporting senior field staff.'
            },
            {
                value: 'engineeringConstructionIntern',
                label: 'Engineering or Construction Intern',
                icon: '🎓',
                description: 'Student or recent graduate gaining practical project experience.'
            }
        ]
    }
];

export const SOCIAL_GROUP_OPTIONS_FLAT = SOCIAL_GROUP_SECTIONS.flatMap((section, sectionIndex) =>
    section.options.map((option, optionIndex) => ({
        ...option,
        sectionTitle: section.title,
        order: sectionIndex * 100 + optionIndex
    }))
);

export const SOCIAL_GROUP_SECTION_ORDER = SOCIAL_GROUP_SECTIONS.map((section) => section.title);

export const SOCIAL_GROUP_OPTION_MAP = SOCIAL_GROUP_OPTIONS_FLAT.reduce((acc, option) => {
    acc[option.value] = option;
    return acc;
}, {});