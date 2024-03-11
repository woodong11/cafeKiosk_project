import axios from "axios";

const DOMAIN = "http://3.36.132.130:8080";

// axios 기본 설정
const request = axios.create({
	baseURL: `${DOMAIN}/api`
});

// vue 프로젝트에서 이렇게 이름 많이 쓰임!
// api 생성하기
export const api = {
	menus : {
		findAll:()=> request.get("/menus"),         // 긴 주소에서 마지막 주소 get한다
		findOne:(id)=> request.get(`/menus/${id}`),

        // 참고: 파일 첨부는 POST 요청만 가능하다. 
        create: (name, description, file) =>{
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("file", file);
            return request.post(`/menus`, formData, {
                headers: {
                    "Constent-Tyle": "multipart/form-data",
                },
            });
        },

        // 메뉴 수정
        update : (id, name, description) =>
            request.patch(`/menus/${id}`, {
                name : name,
                description,
            }),

        // 메뉴 이미지 수정
        updateImage: (id, file) =>{
            const formData = new FormData();
            formData.append("file", file);
            return request.post(`/menus/${id}/image`, formData, {
                headers: {
                    "Constent-Tyle": "multipart/form-data",
                },
            });
        },

        // 메뉴 삭제
        delete: (id) => request.delete(`/menus/${id}`),

	},
	order : {
        // 주문 목록 조회
        fildAll : ()=> request.get("/orders"),

        // 주문 조회
        findOne: (id) => request.get(`/orders/${id}`),

        // 주문하기
        create: (menus_id, quantity, request_detail) =>
            request.post(`/orders`, {
                menus_id,
                quantity,
                request_detail,
            }), 

        // 주문 내역 수정하기
        update: (id, menus_id, quantity, request_detail) => 
        request.patch(`/orders/${id}`, {
            menus_id: menus_id,
            quantity,
            request_detail,
        }),

        // 주문 내역 삭제하기
        delete: (id) => request.delete(`/orders/${id}`),
	},
}