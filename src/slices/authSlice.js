import { createSlice } from '@reduxjs/toolkit';
import { getCookie, setCookie, removeCookie } from '../util/cookieUtil';

const loadStateFromCookie = () => {
    const auth = getCookie('auth');

    const uid = auth?.uid;
    const name = auth?.name;
    const email = auth?.email;
    const hp = auth?.hp;
    const role = auth?.role;
    const grade = auth?.grade;
    const nick = auth?.nick;
    const profile = auth?.profile;
    const rdate = auth?.rdate;
    const company = auth?.company;
    const department = auth?.department;
    const position = auth?.position;
    const accessToken = auth?.accessToken;

    // 리턴에 값을 넣어줘야 초기화가 된 후에도 값이 유지가 됨 //
    return { uid, accessToken, name, email, hp, role, grade, nick, profile, rdate, company, department, position };
};

const initState = {
    uid: '',
    accessToken: '',
};

const authSlice = createSlice({
    name: 'authSlice',
    initialState: loadStateFromCookie() || initState, // 쿠키 확인 후 초기화
    reducers: {
        login: (state, action) => {
            const data = action.payload;

            // 리덕스 저장소 상태 업데이터(Username과 accessToken)
            state.uid = data.uid;
            state.name = data.name;
            state.email = data.email;
            state.hp = data.hp;
            state.role = data.role;
            state.grade = data.grade;
            state.nick = data.nick;
            state.profile = data.profile;
            state.rdate = data.rdate;
            state.company = data.company;
            state.department = data.department;
            state.position = data.position;
            state.accessToken = data.accessToken;

            // 영구보관을 위해 쿠키저장
            setCookie('auth', data, 1);
        },
        logout: (state) => {
            removeCookie('auth');
            // initState를 초기화
            return { ...initState };
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
