import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

export const Seo = (props) => {
  const { title } = props;

  const fullTitle = title
    ? title + ' | Devias Kit PRO'
    : 'Devias Kit PRO';

  return (
    <Helmet>
      <title>
        {fullTitle}
      </title>
    </Helmet>
  );
};

Seo.propTypes = {
  title: PropTypes.string
};
