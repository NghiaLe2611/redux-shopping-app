import React, { useEffect, Fragment, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingIndicator from './components/UI/LoadingIndicator';
import PrivateRoute from './components/PrivateRoute';
import { useSelector, useDispatch } from 'react-redux';
import { authActions } from './store/auth';
import { cartActions } from './store/cart';
import { authApp } from './firebase/config';
import useFetch from './hooks/useFetch';

const Root = React.lazy(() => import('./components/UI/Root'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const DetailPage = React.lazy(() => import('./pages/DetailPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const BrandPage = React.lazy(() => import('./pages/BrandPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const CartConfirmPage = React.lazy(() => import('./pages/CartConfirmPage'));
const ConfirmOrderPage = React.lazy(() => import('./pages/ConfirmOrderPage'));
const ComparePage = React.lazy(() => import('./pages/ComparePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignUpPage = React.lazy(() => import('./pages/SignUpPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const TrackingPage = React.lazy(() => import('./pages/TrackingPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// import Root from './components/UI/Root';
// import HomePage from './pages/HomePage';
// import DetailPage from './pages/DetailPage';
// import CategoryPage from './pages/CategoryPage';
// import NotFound from './pages/NotFound';
// import BrandPage from './pages/BrandPage';
// import CartPage from './pages/CartPage';
// import ComparePage from './pages/ComparePage';

// function getCookie(name) {
// 	const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
// 	return v ? v[2] : null;
// }

function App() {
	const dispatch = useDispatch();
	const userData = useSelector((state) => state.auth.userData);
	const accessToken = useSelector((state) => state.auth.accessToken);
	const isLoggingOut = useSelector((state) => state.auth.isLoggingOut);

	const { fetchData: fetchUser } = useFetch();
	const { fetchData: postUserInfo } = useFetch();
	// const { fetchData: updateUserInfo } = useFetch();

	useEffect(() => {
		// Create user data
		const postUserData = () => {
			// console.log('postUserData');

			const data = {
				uuid: userData.uuid,
				displayName: userData.displayName,
				email: userData.email,
				photoURL: userData.photoURL,
				emailVerified: userData.emailVerified,
			};

			postUserInfo({
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				url: `${process.env.REACT_APP_API_URL}/api/v1/me/account`,
				body: data,
			});
		};

        const getUserData = (user, userDataObj) => {
            // const userDataObj = {
            //     uuid: user.uid,
            //     displayName: user.displayName,
            //     email: user.email,
            //     photoURL: user.photoURL,
            //     emailVerified: user.emailVerified,
            // };

            fetchUser({
                url: `${process.env.REACT_APP_API_URL}/api/v1/me/account`
            }, (data) => {
                    // console.log('fetchUser', data);
                    if (!data) {
                        postUserData();
                    } else {
                        // updateUser();
                        const cloneData = (({ uuid, displayName, email, photoURL, emailVerified, ...val }) => val)(data);

                        dispatch(
                            authActions.updateState({
                                userData: {
                                    ...userDataObj,
                                    ...cloneData,
                                },
                            }),
                        );
                    }
                }
            );
        };

		// Update user data
		// const updateUser = () => {
		//     const data = {
		//         uuid: userData.uuid,
		//         displayName: userData.displayName,
		//         email: userData.email,
		//         photoURL: userData.photoURL,
		//         emailVerified: userData.emailVerified,
		//     };

		//     updateUserInfo({
		//         method: 'PUT',
		//         headers: { 'Content-Type': 'application/json' },
		//         url: `${process.env.REACT_APP_API_URL}/api/v1/me/account`,
		//         body: data
		//     });
		// };

		// const onChangeToken = authApp.onIdTokenChanged(async (user) => {
		// 	user.getIdTokenResult()
		// 		.then((idTokenResult) => {
		// 			console.log(idTokenResult);
		// 		})
		// 		.catch((error) => {
		// 			console.log(error);
		// 		});
		// });
        
		const unregisterAuthObserver = authApp.onAuthStateChanged(async (user) => {
            if (user) {
                const lastTimeLogin = user.metadata.lastLoginAt;
				const currentTime = new Date().getTime();
				// Log out user if more than 1 day
				if (currentTime - lastTimeLogin >= 86400000) { // 86400000: 1 day
                    console.log('Log out due to expired time');
					await authApp.signOut();
					return;
				}

                const userDataObj = {
                    uuid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified,
                };

                dispatch(
                    authActions.updateState({
                        userData: userDataObj
                    }),
                );

                getUserData(user, userDataObj);
            } else {
                dispatch(
                    authActions.updateState({
                        userData: null,
                    }),
                );
                dispatch(authActions.setToken(''));
                dispatch(cartActions.clearCart());
                if (isLoggingOut) {
                    console.log('APP log out');
                    dispatch(authActions.setIsLoggingOut(false));
                }

                // Cookies.remove('csrfToken');
                // Cookies.remove('session');
                // Cookies.remove('idToken');
            }
		});

		// Cleanup subscription on unmount
		return () => {
			unregisterAuthObserver();
			// onChangeToken();
		};
	}, [dispatch]);

    //dispatch, fetchUser, postUserInfo
	// userData.displayName, userData.uuid, userData.email, userData.photoURL, userData.emailVerified

	useEffect(() => {
		if (userData) {
			localStorage.setItem('userData', JSON.stringify(userData));
		} else {
			// console.log('remove storage');
			localStorage.removeItem('userData');
		}
	}, [userData]);

	useEffect(() => {
		if (accessToken) {
			localStorage.setItem('access_token', accessToken);
		} else {
			localStorage.removeItem('access_token');
		}
	}, [accessToken]);

	return (
		<Fragment>
			<Suspense fallback={<LoadingIndicator type='fixed' />}>
				<Routes>
					<Route exact path='/'
						element={
							<Root>
								<HomePage />
							</Root>
						}
					/>
					<Route path='dien-thoai/:productId'
						element={
							<Root>
								<DetailPage />
							</Root>
						}
					/>
					<Route path='may-tinh-bang/:productId'
						element={
							<Root>
								<DetailPage />
							</Root>
						}
					/>
					<Route path='dien-thoai/hang/:brand'
						element={
							<Root>
								<BrandPage />
							</Root>
						}
					/>
					<Route path='may-tinh-bang/hang/:brand'
						element={
							<Root>
								<BrandPage />
							</Root>
						}
					/>
					<Route exact path=':category'
						element={
							<Root>
								<CategoryPage />
							</Root>
						}
					/>
					<Route path='so-sanh/:category'
						element={
							<Root>
								<ComparePage />
							</Root>
						}
					/>
					<Route exact path='cart'
						element={
							<Root>
								<CartPage />
							</Root>
						}
					/>
					<Route exact path='cartConfirm'
						element={
							<Root>
								<CartConfirmPage />
							</Root>
						}
					/>
					<Route exact path='orderDetail/:orderId'
						element={
							<Root>
								<ConfirmOrderPage />
							</Root>
						}
					/>
					<Route exact path='dang-nhap'
						element={
							userData ? (
								<Navigate to='/' />
							) : (
								<Root>
									<LoginPage />
								</Root>
							)
						}
					/>
					<Route exact path='dang-ky'
						element={
							userData ? (
								<Navigate to='/' />
							) : (
								<Root>
									<SignUpPage />
								</Root>
							)
						}
					/>
					<Route path='tai-khoan/*'
						element={
							<PrivateRoute>
								<Root>
									<ProfilePage />
								</Root>
							</PrivateRoute>
						}
					/>
					<Route path='order/:orderId'
						element={
							<PrivateRoute>
								<Root>
									<ProfilePage />
								</Root>
							</PrivateRoute>
						}
					/>
                    <Route path='tracking'
						element={
							<Root>
                                <TrackingPage />
                            </Root>
						}
					/>
					{/* <Route path='tai-khoan' element={<Root><ProfilePage/></Root>} /> */}
					<Route path='*' element={<NotFound />} />
					<Route path='404' element={<NotFound />} />
				</Routes>
			</Suspense>
		</Fragment>
	);
}

export default App;
