"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HttpExternalFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExternalFilter = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let HttpExternalFilter = HttpExternalFilter_1 = class HttpExternalFilter {
    httpAdapterHost;
    logger = new common_1.Logger(HttpExternalFilter_1.name);
    constructor(httpAdapterHost) {
        this.httpAdapterHost = httpAdapterHost;
    }
    catch(exception, host) {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const axiosErr = exception;
        if (axiosErr && axiosErr.isAxiosError) {
            const status = axiosErr.response?.status ?? common_1.HttpStatus.BAD_GATEWAY;
            const message = (() => {
                const respData = axiosErr.response?.data;
                if (!respData)
                    return axiosErr.message ?? 'External service error';
                if (typeof respData === 'string')
                    return respData;
                if (typeof respData === 'object' && respData !== null) {
                    const d = respData;
                    if (typeof d.message === 'string')
                        return d.message;
                    if (d.errors !== undefined) {
                        return { errors: d.errors };
                    }
                }
                return axiosErr.message ?? 'External service error';
            })();
            this.logger.warn({ message, status, url: request?.url });
            httpAdapter.reply(response, { statusCode: status, message }, status);
            return;
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const payload = exception.getResponse();
            httpAdapter.reply(response, payload, status);
            return;
        }
        this.logger.error('Unhandled exception caught by HttpExternalFilter', String(exception));
        const status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        httpAdapter.reply(response, { statusCode: status, message: 'Internal server error' }, status);
    }
};
exports.HttpExternalFilter = HttpExternalFilter;
exports.HttpExternalFilter = HttpExternalFilter = HttpExternalFilter_1 = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [core_1.HttpAdapterHost])
], HttpExternalFilter);
//# sourceMappingURL=http-external.filter.js.map