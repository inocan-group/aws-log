"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
Object.defineProperty(exports, "__esModule", { value: true });

__export(require("./logger"));
__export(require("./types"));
var state_1 = require("./logger/state");
exports.getCorrelationId = state_1.getCorrelationId;
exports.getContext = state_1.getContext;
exports.getState = state_1.getState;
exports.getStage = state_1.getStage;
__export(require("./logger/logging-api"));
