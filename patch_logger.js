const fs = require('fs');
let code = fs.readFileSync('js/scenes/GameScene.js', 'utf8');

const target1 = `                let x, y, rotation;
                let foundSpot = false;

                // Pre-calculate an actual visual radius estimation to correctly prevent overlap with large rectangular sprites`;

const rep1 = `                let x, y, rotation;
                let foundSpot = false;

                // Logger variables
                let logAttempts = 0;
                let logStatus = 'Skipped';
                let logOverlappedTiers = [];

                // Pre-calculate an actual visual radius estimation to correctly prevent overlap with large rectangular sprites`;

code = code.replace(target1, rep1);

const target2 = `                if (hasPositions) {
                    x = entityConfig.positions[i].x * bgScaleRatio;
                    y = entityConfig.positions[i].y * bgScaleRatio;
                    rotation = entityConfig.positions[i].rotation;

                    if (allowReplacement) {
                        for (let j = existingEntities.length - 1; j >= 0; j--) {
                            const existing = existingEntities[j];
                            if (checkEntityOverlap(x, y, radius, entityConfig.hitbox, scale, existing)) {
                                if (entityConfig.hideInPreviousTier) {
                                    // Do not destroy the existing entity, wait for the new entity to become visible
                                } else {
                                    if (existing.sprite && typeof existing.sprite.destroy === 'function') {
                                        existing.sprite.destroy();
                                    }
                                    existingEntities.splice(j, 1);
                                }
                            }
                        }
                    }
                    foundSpot = true;
                } else if (!entityConfig.isHazard) {`;

const rep2 = `                if (hasPositions) {
                    x = entityConfig.positions[i].x * bgScaleRatio;
                    y = entityConfig.positions[i].y * bgScaleRatio;
                    rotation = entityConfig.positions[i].rotation;
                    logAttempts = 1;

                    if (allowReplacement) {
                        for (let j = existingEntities.length - 1; j >= 0; j--) {
                            const existing = existingEntities[j];
                            if (checkEntityOverlap(x, y, radius, entityConfig.hitbox, scale, existing)) {
                                logOverlappedTiers.push(existing.tier);
                                if (entityConfig.hideInPreviousTier) {
                                    // Do not destroy the existing entity, wait for the new entity to become visible
                                } else {
                                    if (existing.sprite && typeof existing.sprite.destroy === 'function') {
                                        existing.sprite.destroy();
                                    }
                                    existingEntities.splice(j, 1);
                                }
                            }
                        }
                    }
                    logStatus = logOverlappedTiers.length > 0 ? 'Overlaps (Replaced/Hidden)' : 'Success';
                    foundSpot = true;
                } else if (!entityConfig.isHazard) {`;

code = code.replace(target2, rep2);

const target3 = `                    let bestFallback = null;

                    for (let attempt = 0; attempt < 50; attempt++) {`;

const rep3 = `                    let bestFallback = null;

                    for (let attempt = 0; attempt < 50; attempt++) {
                        logAttempts = attempt + 1;`;

code = code.replace(target3, rep3); // Replaces first occurrence (edibles)

// For hazards, we also have this block, let's just do a global replace
code = code.split(target3).join(rep3);


const target4 = `                        // Perfect spot found
                        if (overlaps.length === 0) {
                            x = testX;
                            y = testY;
                            foundSpot = true;
                            break;
                        }`;

const rep4 = `                        // Perfect spot found
                        if (overlaps.length === 0) {
                            x = testX;
                            y = testY;
                            foundSpot = true;
                            logStatus = 'Success (0 overlaps)';
                            break;
                        }`;
code = code.split(target4).join(rep4);

const target5 = `                    if (!foundSpot && bestFallback) {
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
const rep5 = `                    if (!foundSpot && bestFallback) {
                        x = bestFallback.x;
                        y = bestFallback.y;
                        foundSpot = true;
                        logStatus = 'Placed with overlaps';

                        // Always collect overlapped tiers for logging
                        for (let idx of bestFallback.overlaps) {
                            logOverlappedTiers.push(existingEntities[idx].tier);
                        }

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
code = code.split(target5).join(rep5);

const target6 = `                    if (!foundSpot) {
                        continue; // Skip placing this edible
                    }`;
const rep6 = `                    if (!foundSpot) {
                        if (GameConfig && GameConfig.DEBUG) {
                            console.log(\`[DEBUG PLACEMENT] Skipped \${entityConfig.type || 'Unknown'} (Tier \${tier}). Attempts: \${logAttempts}. Status: \${logStatus}. allowReplacement: \${allowReplacement}\`);
                        }
                        continue; // Skip placing this edible
                    }`;
code = code.replace(target6, rep6);

const target7 = `                    if (!foundSpot) {
                        continue; // Skip placing this hazard if no valid spot
                    }`;
const rep7 = `                    if (!foundSpot) {
                        if (GameConfig && GameConfig.DEBUG) {
                            console.log(\`[DEBUG PLACEMENT] Skipped \${entityConfig.type || 'Unknown'} (Tier \${tier}). Attempts: \${logAttempts}. Status: \${logStatus}. allowReplacement: \${allowReplacement}\`);
                        }
                        continue; // Skip placing this hazard if no valid spot
                    }`;
code = code.replace(target7, rep7);

const target8 = `                // Calculate subset visibility for Tier N+1 items
                // The user requested to show all higher tier items at lower tiers`;
const rep8 = `                if (foundSpot && GameConfig && GameConfig.DEBUG) {
                    const overlapStr = logOverlappedTiers.length > 0 ? \` Overlapped Tiers: [\${logOverlappedTiers.join(', ')}].\` : '';
                    console.log(\`[DEBUG PLACEMENT] Placed \${entityConfig.type || 'Unknown'} (Tier \${tier}) at (\${x.toFixed(1)}, \${y.toFixed(1)}). Attempts: \${logAttempts}. Status: \${logStatus}.\${overlapStr} Scaling Ratio: \${bgScaleRatio.toFixed(2)}. allowReplacement: \${allowReplacement}\`);
                }

                // Calculate subset visibility for Tier N+1 items
                // The user requested to show all higher tier items at lower tiers`;
code = code.replace(target8, rep8);

fs.writeFileSync('js/scenes/GameScene.js', code);
