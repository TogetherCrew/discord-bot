"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionType = exports.InteractionResponseType = void 0;
// InteractionResponseType
var InteractionResponseType;
(function (InteractionResponseType) {
    InteractionResponseType[InteractionResponseType["PONG"] = 1] = "PONG";
    InteractionResponseType[InteractionResponseType["CHANNEL_MESSAGE_WITH_SOURCE"] = 4] = "CHANNEL_MESSAGE_WITH_SOURCE";
    InteractionResponseType[InteractionResponseType["DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE"] = 5] = "DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE";
    InteractionResponseType[InteractionResponseType["DEFERRED_UPDATE_MESSAGE"] = 6] = "DEFERRED_UPDATE_MESSAGE";
    InteractionResponseType[InteractionResponseType["UPDATE_MESSAGE"] = 7] = "UPDATE_MESSAGE";
    InteractionResponseType[InteractionResponseType["APPLICATION_COMMAND_AUTOCOMPLETE_RESULT"] = 8] = "APPLICATION_COMMAND_AUTOCOMPLETE_RESULT";
    InteractionResponseType[InteractionResponseType["MODAL"] = 9] = "MODAL";
    InteractionResponseType[InteractionResponseType["PREMIUM_REQUIRED"] = 10] = "PREMIUM_REQUIRED";
})(InteractionResponseType || (exports.InteractionResponseType = InteractionResponseType = {}));
// InteractionType
var InteractionType;
(function (InteractionType) {
    InteractionType[InteractionType["PING"] = 1] = "PING";
    InteractionType[InteractionType["APPLICATION_COMMAND"] = 2] = "APPLICATION_COMMAND";
    InteractionType[InteractionType["MESSAGE_COMPONENT"] = 3] = "MESSAGE_COMPONENT";
    InteractionType[InteractionType["APPLICATION_COMMAND_AUTOCOMPLETE"] = 4] = "APPLICATION_COMMAND_AUTOCOMPLETE";
    InteractionType[InteractionType["MODAL_SUBMIT"] = 5] = "MODAL_SUBMIT";
})(InteractionType || (exports.InteractionType = InteractionType = {}));
