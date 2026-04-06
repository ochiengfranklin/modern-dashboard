// import { createSimpleRestDataProvider } from "@refinedev/rest/simple-rest";
// import { API_URL } from "./constants";
// export const { dataProvider, kyInstance } = createSimpleRestDataProvider({
//   apiURL: API_URL,
// });

 import {createDataProvider, CreateDataProviderOptions} from "@refinedev/rest";
import {ListResponse} from "@/types";
import {BACKEND_BASE_URL} from "@/constants";

if(!BACKEND_BASE_URL) {
    throw new Error("BACKEND_BASE_URL is missing");
}

const options: CreateDataProviderOptions = {
    getList: {
        getEndpoint: ({ resource }) => resource,

        buildQueryParams: async ({ resource, pagination, filters }) => {
            const page = pagination?.currentPage ?? 1;
            const pageSize = pagination?.pageSize ?? 10;

            const params: Record<string, string | number> = {
                page,
                limit: pageSize,
            };

            filters?.forEach((filter) => {
                const field = 'field' in filter ? filter.field : '';
                const value = String(filter.value);

                if (resource === 'subjects') {
                    if (field === 'department') params.department = value;
                    if (field === 'name' || field === 'code') params.search = value;
                }
            });


            return params;
        },
        mapResponse: async (response) => {
            const payload: ListResponse = await response.clone().json();

            return payload.data ?? [];
        },
        getTotalCount: async (response) => {
            const payload: ListResponse = await response.clone().json();

            return payload.pagination?.total ?? payload.data?.length ?? 0;
        }

    }
}
console.log('dataprovider')

const { dataProvider } = createDataProvider( BACKEND_BASE_URL, options);
export  {dataProvider};