import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

export const Seo = (props) => {
  const { title, description } = props;

  const fullTitle = title
    ? title + ' | CTMASS'
    : 'CTMASS - Find Trusted Construction Specialists in CT & MA';

  return (
    <Helmet>
      <title>
        {fullTitle}
      </title>
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
    </Helmet>
  );
};

Seo.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string
};
