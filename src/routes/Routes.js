import { Outlet } from 'react-router-dom';
import Register from '../page/reception/register/Register';
import Main from '../page/reception/groups/Main';
import CreateCards from '../page/reception/createCards/CreateCards';
import StudentList from '../page/reception/studentList/StudentList';
import CreateTeacher from '../page/owner/createTeacher/CreateTeacher';
import TeachersTable from '../page/owner/createTeacher/ReadTeacher';
import PayController from '../components/payController/PayController';
import StudentSinglePage from '../components/studentSinglePage/StudentSinglePage';
import Balans from '../page/owner/balans/Balans';
import Single_page from '../components/workersSinglePage/WorkersSinglePage';
import Students from '../page/reception/groups/activeGroups/students';

export const routes = [
    { path: '/register/:id', element: <Register /> },
    { path: '/createCards', element: <CreateCards /> },
    { path: '/reports', element: <Main /> },
    { path: '/createTeacher', element: <CreateTeacher /> },
    { path: '/getTeacher', element: <TeachersTable /> },
    { path: '/payController', element: <PayController /> },
    { path: '/balans', element: <Balans /> },
    { path: '/single_page/:id', element: <Single_page /> },
    { path: '/studentList/:id', element: <StudentList /> },
    { path: '/student/single_page/:id/:groupId', element: <StudentSinglePage /> },
    { path: '/students/:id', element: <Students /> },
    { path: '/', element: <Outlet /> },
];

