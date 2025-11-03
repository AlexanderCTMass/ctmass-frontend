import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import { emailTemplateService } from 'src/service/email-template-service'

export async function exportTemplatesToXLS() {
    const list = await emailTemplateService.list();
    const rows = list
        .map(tpl => {
            const v = Object.values(tpl.versions || {}).find(v => v.isActive);
            if (!v) return undefined;
            return {
                Trigger: tpl.trigger,
                Name: tpl.description || tpl.name,
                'Subject Template': v.subject,
                'HTML Template': v.htmlTemplate,
                'Text Template': v.textVersion,
                'Last Updated': format(v.createdAt?.toDate?.() ?? new Date(), 'dd.MM.yyyy')
            };
        })
        .filter(Boolean);

    if (!rows.length) return;

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)

    const colWidths = Object.keys(rows[0]).map((k) => {
        const max = Math.max(
            k.length,
            ...rows.map(r => String(r[k]).length)
        );
        return { wch: Math.min(Math.max(max + 2, 10), 60) };
    });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Email templates');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'email_templates.xlsx');
}