const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    MessageFlags,
    SeparatorSpacingSize,
} = require('discord.js');

/**
 * Luxxy Hosting Color Palette
 */
const C = {
    Success: 0x57F287,
    Error: 0xED4245,
    Warning: 0xFEE75C,
    Info: 0x5865F2,
    Blurple: 0x5865F2,
    Aqua: 0x1ABC9C,
    Gold: 0xF1C40F,
    Orange: 0xE67E22,
    Purple: 0x9B59B6,
    DarkGrey: 0x2C2F33,
};

/** Shorthand for sending Components v2 messages */
const V2 = { flags: MessageFlags.IsComponentsV2 };

/**
 * Create a styled container with accent color, title, and optional content.
 * @param {number} color - Accent color hex
 * @param {string} title - Title text (markdown enabled, will be ## heading)
 * @param {string} [description] - Description below the title
 * @param {Array<{name: string, value: string}>} [fields] - Key-value fields
 * @returns {ContainerBuilder}
 */
function makeContainer(color, title, description, fields) {
    const c = new ContainerBuilder().setAccentColor(color);

    if (title) {
        c.addTextDisplayComponents(td => td.setContent(title));
    }

    if (description) {
        c.addTextDisplayComponents(td => td.setContent(description));
    }

    if (fields && fields.length > 0) {
        c.addSeparatorComponents(sep => sep.setDivider(true));
        const fieldText = fields.map(f => `**${f.name}**\n${f.value}`).join('\n');
        c.addTextDisplayComponents(td => td.setContent(fieldText));
    }

    return c;
}

/** ✅ Green success container */
function successMsg(title, desc, fields) {
    return makeContainer(C.Success, `## ✅ ${title}`, desc, fields);
}

/** ❌ Red error container */
function errorMsg(title, desc) {
    return makeContainer(C.Error, `## ❌ ${title}`, desc);
}

/** ⚠️ Yellow warning container */
function warnMsg(title, desc) {
    return makeContainer(C.Warning, `## ⚠️ ${title}`, desc);
}

/** ℹ️ Blue info container */
function infoMsg(title, desc, fields) {
    return makeContainer(C.Info, `## ℹ️ ${title}`, desc, fields);
}

/** ⏳ Blue loading container */
function loadingMsg(text) {
    const c = new ContainerBuilder().setAccentColor(C.Info);
    c.addTextDisplayComponents(td => td.setContent(`⏳ ${text || 'Loading...'}`));
    return c;
}

/** Simple text in a container (for progress/edit updates) */
function textContainer(color, text) {
    const c = new ContainerBuilder().setAccentColor(color);
    c.addTextDisplayComponents(td => td.setContent(text));
    return c;
}

module.exports = {
    C, V2,
    makeContainer,
    successMsg,
    errorMsg,
    warnMsg,
    infoMsg,
    loadingMsg,
    textContainer,
};
