const Loader = ({ text = "Loading..." }) => (
  <div className="loader" role="status" aria-label={text}>
    <div className="spinner" aria-hidden="true" />
    <p>{text}</p>
  </div>
);

export default Loader;
