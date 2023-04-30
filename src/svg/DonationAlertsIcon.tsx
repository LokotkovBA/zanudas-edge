type DonationAlertsIconProps = {
    size: string;
};

const DonationAlertsIcon: React.FC<DonationAlertsIconProps> = ({ size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 37 43"
            className="fill-inherit"
        >
            <path
                fillRule="nonzero"
                d="M18.692 25.041h-2.906a.63.63 0 0 1-.445-.175.502.502 0 0 1-.152-.415l.257-2.626c.025-.28.285-.495.596-.494h2.907c.17 0 .33.063.445.176.113.112.169.263.152.414l-.257 2.627c-.025.28-.285.494-.597.493zm.466-5.143h-2.96a.582.582 0 0 1-.593-.571l.806-8.875a.585.585 0 0 1 .592-.503h2.96c.327 0 .593.256.593.571l-.83 8.88a.585.585 0 0 1-.568.498zM36.566 9.549L28.898.63A1.81 1.81 0 0 0 27.525 0H4.56a1.803 1.803 0 0 0-1.8 1.616L.006 32.896c-.044.503.126 1 .468 1.373a1.81 1.81 0 0 0 1.332.582h4.51L5.63 43l8.869-8.143h10.074c.47 0 .922-.18 1.26-.507l9.462-9.155c.312-.302.504-.705.541-1.137l1.157-13.184a1.794 1.794 0 0 0-.427-1.325zm-7.013 11.994a1.796 1.796 0 0 1-.541 1.142l-5.478 5.197a1.81 1.81 0 0 1-1.249.496h-13.4a1.831 1.831 0 0 1-1.324-.59 1.816 1.816 0 0 1-.476-1.365L8.707 8.11a1.803 1.803 0 0 1 1.8-1.616h13.628c.522 0 1.02.226 1.362.62l4.326 4.976c.326.358.494.832.465 1.314l-.735 8.138z"
            />
        </svg>
    );
};

export default DonationAlertsIcon;