import Header from '@/components/header/Header';
import './main.scss';
import BalatroShaderBackground from '@/components/background/BalatroShader';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <BalatroShaderBackground />
            <Header />
            {/* {children} */}
        </>
    );
}
