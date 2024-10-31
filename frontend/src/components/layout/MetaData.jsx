import { Helmet } from "react-helmet";

const MetaData = ({ title }) => {
    return (
        <Helmet> 
            <title>{`${title} - Quality You Can Trust, Convenience You’ll Love`}</title>
        </Helmet>
    );
};

export default MetaData;