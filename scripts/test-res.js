const mongoose = require('mongoose');
const { computeResonance } = require('./lib/resonanceEngine.ts'); // Wait, I can't require a TS file directly in a simple script unless I use ts-node or compile it.
