import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, keywords, canonical, image, url }) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />
            {keywords && <meta name='keywords' content={keywords} />}
            {canonical && <link rel="canonical" href={canonical} />}
            {/* End standard metadata tags */}

            {/* Facebook tags */}
            <meta property='og:type' content={type} />
            <meta property='og:title' content={title} />
            <meta property='og:description' content={description} />
            {image && <meta property="og:image" content={image} />}
            {url && <meta property="og:url" content={url} />}
            {/* End Facebook tags */}

            {/* Twitter tags */}
            <meta name='twitter:creator' content={name} />
            <meta name='twitter:card' content={image ? 'summary_large_image' : 'summary'} />
            <meta name='twitter:title' content={title} />
            <meta name='twitter:description' content={description} />
            {image && <meta name='twitter:image' content={image} />}
            {/* End Twitter tags */}

            {/* Schema.org JSON-LD */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

SEO.defaultProps = {
    title: 'BudgetTracko - Smart Expense Manager',
    description: 'Manage your expenses and track your budget with BudgetTracko.',
    name: 'BudgetTracko',
    type: 'website',
    keywords: 'budget, expense manager, finance, money tracker, budget tracker',
    canonical: 'https://www.budgettracko.app/',
    url: 'https://www.budgettracko.app/',
    image: 'https://www.budgettracko.app/og-image.png',
    schema: null
};

export default SEO;
