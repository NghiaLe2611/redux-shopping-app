import { useEffect, useRef } from 'react'

export const formatCurrency = (x) => {
    // const price = parseInt(x) * 23000;
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const convertProductLink = (str) => {
    return str.toLowerCase().split(" ").join("-");
}

export const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
};

export const removeQueryParam = (name, _url) => {
    var reg = new RegExp("((&)*" + name + "=([^&]*))","g");
    return _url.replace(reg,'');
};

export const removeAccents = (str) => {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

export const timeSince = (date) => {
	var seconds = Math.floor((new Date() - date) / 1000);

	var interval = seconds / 31536000;

	if (interval > 1) {
		return Math.floor(interval) + ' năm trước';
	}
	interval = seconds / 2592000;
	if (interval > 1) {
		return Math.floor(interval) + ' tháng trước';
	}
	interval = seconds / 86400;
	if (interval > 1) {
		return Math.floor(interval) + ' ngày trước';
	}
	interval = seconds / 3600;
	if (interval > 1) {
		return Math.floor(interval) + ' giờ trước';
	}
	interval = seconds / 60;
	if (interval > 1) {
		return Math.floor(interval) + ' phút trước';
	}
	return Math.floor(seconds) + ' giây trước';
};

export const emailIsValid = (email) => {
    const regex = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm;
    return email.match(regex);
};

export const passwordIsValid = (password) => {
    // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and no special character
    // /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/

    // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number
    const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;
    return password.match(regex);
};
