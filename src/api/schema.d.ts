export interface paths {
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["HealthController_getHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login de Administrador de RRHH */
        post: operations["AuthController_login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Devuelve el usuario de la sesión actual */
        get: operations["AuthController_session"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Envía el link mágico de recuperación de contraseña */
        post: operations["AuthController_resetPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/areas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AreasController_findAll"];
        put?: never;
        post: operations["AreasController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/areas/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["AreasController_remove"];
        options?: never;
        head?: never;
        patch: operations["AreasController_update"];
        trace?: never;
    };
    "/empleados": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["EmpleadosController_findAll"];
        put?: never;
        post: operations["EmpleadosController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/empleados/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Ficha completa por id o legajo */
        get: operations["EmpleadosController_findById"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Edita campos; registra en auditoría los cambios */
        patch: operations["EmpleadosController_update"];
        trace?: never;
    };
    "/empleados/{id}/baja": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Baja lógica: Estado → inactivo, sin borrado físico */
        post: operations["EmpleadosController_darDeBaja"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/empleados/{id}/reactivar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reactiva un Empleado inactivo → Estado activo */
        post: operations["EmpleadosController_reactivar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/licencias": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Histórico de licencias de un Empleado (más recientes primero) */
        get: operations["LicenciasController_findAll"];
        put?: never;
        /** Registra una licencia; sincroniza el Estado del Empleado */
        post: operations["LicenciasController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        HealthStatus: {
            /**
             * @description Estado general del servicio
             * @example ok
             */
            status: string;
        };
        LoginDto: {
            /** @example rrhh@empresa.com */
            email: string;
            password: string;
        };
        LoginResponse: {
            access_token: string;
            token_type: string;
            user: {
                id?: string;
                email?: string;
            };
        };
        SessionUser: {
            id: string;
            email?: string;
        };
        ResetPasswordDto: {
            /** @example rrhh@empresa.com */
            email: string;
        };
        AreaResponse: {
            id: string;
            nombre: string;
            supervisorId: string | null;
        };
        CreateAreaDto: {
            /** @example Mantenimiento */
            nombre: string;
            /** @description Id de un Empleado activo que supervisa el Área */
            supervisorId?: string;
        };
        UpdateAreaDto: {
            /** @example Mantenimiento */
            nombre?: string;
            /** @description Id de un Empleado activo; null para quitar */
            supervisorId?: string | null;
        };
        EmpleadoListItem: {
            id: string;
            legajo: string;
            nombre: string;
            apellido: string;
            puesto: string | null;
            /** @enum {string} */
            estado: "activo" | "inactivo" | "licencia";
            areaId: string | null;
            areaNombre: string | null;
        };
        PaginatedEmpleados: {
            items: components["schemas"]["EmpleadoListItem"][];
            total: number;
            page: number;
            pageSize: number;
        };
        EmpleadoDetalle: {
            id: string;
            legajo: string;
            nombre: string;
            apellido: string;
            dni: string;
            fechaNacimiento: string | null;
            email: string | null;
            telefono: string | null;
            direccion: string | null;
            puesto: string | null;
            fechaIngreso: string | null;
            /** @enum {string} */
            estado: "activo" | "inactivo" | "licencia";
            areaId: string | null;
            areaNombre: string | null;
            supervisorId: string | null;
            supervisorNombre: string | null;
        };
        CreateEmpleadoDto: {
            /** @description Si no se provee, se autgenera secuencialmente */
            legajo?: string;
            nombre: string;
            apellido: string;
            dni: string;
            fechaNacimiento?: string | null;
            email?: string;
            telefono?: string;
            direccion?: string;
            /** @example Mantenimiento de electricidad */
            puesto?: string;
            fechaIngreso?: string | null;
            areaId?: string;
            /** @description Id de un Empleado activo */
            supervisorId?: string;
        };
        UpdateEmpleadoDto: {
            /** @description Legajo nuevo (debe ser único) */
            legajo?: string;
            nombre?: string;
            apellido?: string;
            dni?: string;
            fechaNacimiento?: string | null;
            email?: string;
            telefono?: string;
            direccion?: string;
            /** @example Mantenimiento de electricidad */
            puesto?: string;
            fechaIngreso?: string | null;
            areaId?: string;
            /** @description Id de un Empleado activo */
            supervisorId?: string;
        };
        CreateLicenciaDto: {
            empleadoId: string;
            /** Format: date-time */
            desde: string;
            /** Format: date-time */
            hasta: string;
            motivo?: string;
        };
        LicenciaResponse: {
            id: string;
            empleadoId: string;
            /** Format: date-time */
            desde: string;
            /** Format: date-time */
            hasta: string;
            motivo: string | null;
            /** @description desde ≤ hoy ≤ hasta */
            vigente: boolean;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    HealthController_getHealth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthStatus"];
                };
            };
        };
    };
    AuthController_login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponse"];
                };
            };
        };
    };
    AuthController_logout: {
        parameters: {
            query?: never;
            header: {
                authorization: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_session: {
        parameters: {
            query?: never;
            header: {
                authorization: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionUser"];
                };
            };
        };
    };
    AuthController_resetPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AreasController_findAll: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AreaResponse"][];
                };
            };
        };
    };
    AreasController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAreaDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AreaResponse"];
                };
            };
        };
    };
    AreasController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AreasController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAreaDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AreaResponse"];
                };
            };
        };
    };
    EmpleadosController_findAll: {
        parameters: {
            query?: {
                /** @description Búsqueda por nombre, apellido o legajo */
                search?: string;
                areaId?: string;
                estado?: "activo" | "inactivo" | "licencia";
                page?: number;
                pageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedEmpleados"];
                };
            };
        };
    };
    EmpleadosController_create: {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer <token> del Administrador de RRHH */
                authorization?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateEmpleadoDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmpleadoListItem"];
                };
            };
        };
    };
    EmpleadosController_findById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmpleadoDetalle"];
                };
            };
        };
    };
    EmpleadosController_update: {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer <token> del Administrador de RRHH */
                authorization?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateEmpleadoDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmpleadoDetalle"];
                };
            };
        };
    };
    EmpleadosController_darDeBaja: {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer <token> del Administrador de RRHH */
                authorization?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmpleadoDetalle"];
                };
            };
        };
    };
    EmpleadosController_reactivar: {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer <token> del Administrador de RRHH */
                authorization?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmpleadoDetalle"];
                };
            };
        };
    };
    LicenciasController_findAll: {
        parameters: {
            query: {
                empleadoId: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LicenciaResponse"][];
                };
            };
        };
    };
    LicenciasController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateLicenciaDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LicenciaResponse"];
                };
            };
        };
    };
}
