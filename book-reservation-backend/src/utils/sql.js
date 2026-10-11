// Make % and _ in user text match literally inside LIKE
exports.escapeLike = (text) => text.replace(/[\\%_]/g, (ch) => `\\${ch}`);
