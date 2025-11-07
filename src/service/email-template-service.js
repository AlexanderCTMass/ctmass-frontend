import { firestore } from 'src/libs/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
    setDoc
} from 'firebase/firestore';

import Handlebars from 'handlebars/dist/handlebars.min.js';
import * as yup from 'yup';
import { EmailTriggers } from 'src/constants/email-triggers';

const TEMPLATES_COL = collection(firestore, 'emailTemplates');

const compileMarkup = (markup, data) => {
    if (!Handlebars.helpers.eq) {
        Handlebars.registerHelper('eq', (a, b) => a === b);
    }
    return Handlebars.compile(markup, { noEscape: true })(data);
};

class EmailTemplateService {
    async getActive(name) {
        const snap = await getDoc(doc(TEMPLATES_COL, name));
        if (!snap.exists()) return null;

        const tpl = snap.data();
        const activeVer = Object.values(tpl.versions || {})
            .find(v => v.isActive);
        return activeVer
            ? { ...activeVer, meta: { name, variableSchema: tpl.variableSchema } }
            : null;
    }

    async getActiveByTrigger(trigger) {
        const q = query(
            TEMPLATES_COL,
            where('trigger', '==', trigger),
            where('enabled', '==', true)
        );

        const snap = await getDocs(q);
        if (snap.empty) return null;

        let newest = null;
        snap.docs.forEach(d => {
            const tpl = d.data();
            const activeVer = Object.values(tpl.versions || {}).find(v => v.isActive);
            if (activeVer) {
                if (!newest || activeVer.createdAt?.toMillis() > newest.createdAt?.toMillis()) {
                    newest = {
                        ...activeVer,
                        meta: { name: d.id, variableSchema: tpl.variableSchema }
                    };
                }
            }
        });
        return newest;
    }

    async compile(name, data) {
        const active = await this.getActive(name);
        return active ? this._compile(active, data) : null;
    }

    async compileByTrigger(trigger, data) {
        const active = await this.getActiveByTrigger(trigger);
        return active ? this._compile(active, data) : null;
    }

    _compile(active, data) {
        this._validate(active.meta.variableSchema, data);
        const compiled = {
            subject: compileMarkup(active.subject, data),
            html: active.htmlTemplate
                ? compileMarkup(active.htmlTemplate, data)
                : undefined,
            text: active.textVersion
                ? compileMarkup(active.textVersion, data)
                : undefined
        };

        if (!compiled.html && !compiled.text) {
            throw new Error('Template has neither html nor text version');
        }
        return compiled;
    }

    async list() {
        const snap = await getDocs(TEMPLATES_COL);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async createOrUpdate(name, payload, userId) {
        const ref = doc(TEMPLATES_COL, name);
        const snap = await getDoc(ref);
        const now = serverTimestamp();

        const base = {
            name,
            trigger: payload.trigger,
            variableSchema: payload.variableSchema,
            enabled: true
        };

        if (!snap.exists()) {
            await setDoc(ref, {
                ...base,
                versions: {
                    [payload.version]: {
                        ...payload,
                        createdAt: now,
                        createdBy: userId,
                        isActive: true
                    }
                }
            });
        } else {
            const old = snap.data();
            Object.values(old.versions || {}).forEach(v => (v.isActive = false));

            await updateDoc(ref, {
                ...base,
                versions: {
                    ...old.versions,
                    [payload.version]: {
                        ...payload,
                        createdAt: now,
                        createdBy: userId,
                        isActive: true
                    }
                }
            });
        }

        const sameTriggerSnap = await getDocs(
            query(TEMPLATES_COL, where('trigger', '==', payload.trigger))
        );

        await Promise.all(
            sameTriggerSnap.docs
                .filter(d => d.id !== name)
                .map(async d => {
                    const data = d.data();
                    let changed = false;
                    Object.values(data.versions || {}).forEach(v => {
                        if (v.isActive) { v.isActive = false; changed = true; }
                    });
                    if (data.enabled) { data.enabled = false; changed = true; }
                    if (changed) await updateDoc(doc(TEMPLATES_COL, d.id), data);
                })
        );
    }

    _validate(schemaDef = {}, data) {
        const shape = {};
        Object.entries(schemaDef).forEach(([key, cfg]) => {
            switch (cfg.type) {
                case 'string':
                    shape[key] = yup.string()[cfg.required ? 'required' : 'nullable']();
                    break;
                case 'object':
                default:
                    shape[key] = yup.mixed();
            }
        });

        yup.object(shape).validateSync(data, { abortEarly: false });
    }
}

export const emailTemplateService = new EmailTemplateService();

export const ALL_TRIGGERS = Object.values(EmailTriggers);