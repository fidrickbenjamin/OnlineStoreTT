import { Helmet } from "react-helmet";

const MetaData = ({ title }) => {
    const pageTitle = title ? `${title} | Tactical Trends Marketplace` : "Tactical Trends Marketplace";

    return (
        <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content="Tactical Trends Marketplace offers tactical gear, outdoor essentials, and everyday carry products with dependable service." />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:site_name" content="Tactical Trends Marketplace" />
            <meta property="twitter:title" content={pageTitle} />
        </Helmet>
    );
};

export default MetaData;