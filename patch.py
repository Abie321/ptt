const fs = require('fs');

const path = 'js/scenes/GameScene.js';
let content = fs.readFileSync(path, 'utf8');

const search = `                        // If we have allowReplacement and it only overlaps with lower tier entities
                        if (allowReplacement && !hasSameOrHigherTierOverlap) {
                            bestFallback = { x: testX, y: testY, overlaps: overlaps };
                        }
                    }

                    if (!foundSpot && bestFallback) {
                        x = bestFallback.x;
                        y = bestFallback.y;
                        foundSpot = true;

                        if (!entityConfig.hideInPreviousTier) {
                            // Sort descending so splicing doesn't mess up indices
                            bestFallback.overlaps.sort((a, b) => b - a);
                            for (let idx of bestFallback.overlaps) {
                                const existing = existingEntities[idx];
                                if (existing.sprite && typeof existing.sprite.destroy === 'function') {
                                    existing.sprite.destroy();
                                }
                                existingEntities.splice(idx, 1);
                            }
                        }
                    }`;

const replace = `                        // If we have allowReplacement and it only overlaps with lower tier entities
                        if (allowReplacement) {
                            bestFallback = { x: testX, y: testY, overlaps: overlaps };
                        }
                    }

                    if (!foundSpot && bestFallback) {
                        x = bestFallback.x;
                        y = bestFallback.y;
                        foundSpot = true;

                        if (!entityConfig.hideInPreviousTier) {
                            // Sort descending so splicing doesn't mess up indices
                            bestFallback.overlaps.sort((a, b) => b - a);
                            for (let idx of bestFallback.overlaps) {
                                const existing = existingEntities[idx];
                                if (existing.tier < tier) {
                                    if (existing.sprite && typeof existing.sprite.destroy === 'function') {
                                        existing.sprite.destroy();
                                    }
                                    existingEntities.splice(idx, 1);
                                }
                            }
                        }
                    }`;

content = content.replace(search, replace);
fs.writeFileSync(path, content);
