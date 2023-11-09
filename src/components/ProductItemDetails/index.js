// Write your code here
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'
import Loader from 'react-loader-spinner'
import {Component} from 'react'
import Cookies from 'js-cookie'
import Header from '../Header'
import './index.css'
import SimilarProductItem from '../SimilarProductItem'

const statusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    productDetails: [],
    itemsCount: 1,
    similarProductsDetails: [],
    apiStatus: statusConstants.initial,
  }

  componentDidMount() {
    this.getProductDetails()
  }

  updateData = data => ({
    title: data.title,
    id: data.id,
    imageUrl: data.image_url,
    rating: data.rating,
    brand: data.brand,
    availability: data.availability,
    price: data.price,
    totalReviews: data.total_reviews,
    description: data.description,
  })

  getProductDetails = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params
    this.setState({apiStatus: statusConstants.inProgress})

    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }

    const response = await fetch(apiUrl, options)

    if (response.ok === true) {
      const data = await response.json()

      const productData = this.updateData(data)
      const similarData = data.similar_products.map(eachItem =>
        this.updateData(eachItem),
      )
      this.setState({
        productDetails: productData,
        similarProductsDetails: similarData,
        apiStatus: statusConstants.success,
      })
    }

    if (response.status === 404) {
      this.setState({apiStatus: statusConstants.failure})
    }
  }

  increaseCount = () => {
    this.setState(prevState => ({
      itemsCount: prevState.itemsCount + 1,
    }))
  }

  decreaseCount = () => {
    const {itemsCount} = this.state
    if (itemsCount > 1) {
      this.setState(prevState => ({
        itemsCount: prevState.itemsCount - 1,
      }))
    }
  }

  renderSuccess = () => {
    const {productDetails, itemsCount, similarProductsDetails} = this.state
    const {
      brand,
      title,
      description,
      totalReviews,
      rating,
      availability,
      imageUrl,
      price,
    } = productDetails

    return (
      <div className="products-sections">
        <div className="first-container">
          <img src={imageUrl} alt="Product" className="image" />
          <div className="text-container">
            <h1>{title}</h1>
            <p>Rs {price}</p>
            <div className="rating-container">
              <p>{rating}</p>
              <img
                src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                alt="star"
                className="star-image"
              />
            </div>
            <p>{totalReviews}</p>
            <p>{description}</p>
            <p>Available: {availability}</p>
            <p>Brand: {brand}</p>
            <hr />
            <div className="buttons-container">
              <button
                type="button"
                data-testid="minus"
                onClick={this.decreaseCount}
                className="button"
              >
                <BsDashSquare />
              </button>
              <p>{itemsCount}</p>
              <button
                type="button"
                className="button"
                data-testid="plus"
                onClick={this.increaseCount}
              >
                <BsPlusSquare />
              </button>
            </div>
            <button type="button">ADD TO CART</button>
          </div>
        </div>
        <div>
          <h1>Similar Products</h1>
          <ul className="similar">
            {similarProductsDetails.map(eachItem => (
              <SimilarProductItem productData={eachItem} key={eachItem.id} />
            ))}
          </ul>
        </div>
      </div>
    )
  }

  products = () => {
    const {history} = this.props
    history.replace('/products')
  }

  renderFailure = () => (
    <div>
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
        className="error-image"
      />
      <div className="error-container">
        <h1 className="error-heading">Product Not Found</h1>
        <button type="button" className="continue" onClick={this.products}>
          Continue Shopping
        </button>
      </div>
    </div>
  )

  renderLoading = () => (
    <div data-testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height={80} width={80} />
    </div>
  )

  renderStatus = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case statusConstants.success:
        return this.renderSuccess()
      case statusConstants.failure:
        return this.renderFailure()
      case statusConstants.inProgress:
        return this.renderLoading()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="overall-container">{this.renderStatus()}</div>
      </>
    )
  }
}

export default ProductItemDetails
