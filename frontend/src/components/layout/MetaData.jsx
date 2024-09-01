import { Helmet } from "react-helmet";

const MetaData = ({ title }) => {
    return (
        <Helmet> 
            <title>{`${title} - Online Store TT`}</title>
        </Helmet>
    );
};

export default MetaData;