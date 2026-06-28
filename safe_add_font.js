const fs = require('fs');

function replaceSafe(file, replacements) {
    if(!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    replacements.forEach(([from, to]) => {
        content = content.replaceAll(from, to);
    });
    if(content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
}

replaceSafe('app/page.tsx', [
    ['text-[11px] uppercase tracking-[0.3em] text-[#a89c8d]', 'text-[11px] uppercase tracking-[0.3em] text-[#a89c8d] font-researcher'],
    ['text-[11px] uppercase tracking-[0.25em] text-[#a89c8d]/70', 'text-[11px] uppercase tracking-[0.25em] text-[#a89c8d]/70 font-researcher'],
    ['text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70', 'text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70 font-researcher'],
    ['text-[11px] font-bold uppercase tracking-[0.4em] text-[#a89c8d]/60', 'text-[11px] font-bold uppercase tracking-[0.4em] text-[#a89c8d]/60 font-researcher'],
    ['text-[10px] uppercase tracking-[0.25em] text-[#a89c8d]/40', 'text-[10px] uppercase tracking-[0.25em] text-[#a89c8d]/40 font-researcher'],
    ['text-[10px] uppercase tracking-[0.25em] w-max font-bold', 'text-[10px] uppercase tracking-[0.25em] w-max font-bold font-researcher'],
    ['text-[11px] font-semibold tracking-[0.3em] text-[#a89c8d]/40', 'text-[11px] font-semibold tracking-[0.3em] text-[#a89c8d]/40 font-researcher']
]);

replaceSafe('components/Credentials.tsx', [
    ['text-[10px] uppercase tracking-[0.3em] text-[#8c7d6e]', 'text-[10px] uppercase tracking-[0.3em] text-[#8c7d6e] font-researcher'],
    ['text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-[#ff8a3d]', 'text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-[#ff8a3d] font-researcher'],
    ['text-[11px] font-bold tracking-[0.15em] uppercase text-[#8c7d6e]', 'text-[11px] font-bold tracking-[0.15em] uppercase text-[#8c7d6e] font-researcher']
]);

replaceSafe('components/StatsMarquee.tsx', [
    ['text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#a89c8d]/70', 'text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#a89c8d]/70 font-researcher']
]);

replaceSafe('components/Education.tsx', [
    ['text-[10px] md:text-xs text-[#a89c8d]/60 font-semibold tracking-[0.3em] uppercase', 'text-[10px] md:text-xs text-[#a89c8d]/60 font-semibold tracking-[0.3em] uppercase font-researcher'],
    ['text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70', 'text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70 font-researcher']
]);
