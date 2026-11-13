export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            {...props}
            src="/images/logo.png"
            alt="Papelería Betty"
            className={`object-contain ${className}`.trim()}
        />
    );
}
