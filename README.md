# eslint-plugin-vee-validate-migrator

This plugin provides a set of ESLint rules to help migrate from Vee Validate v3 to Vee Validate v4.

https://github.com/logaretm/vee-validate/issues/2849#issuecomment-2032888711

## Usage

Follow these steps to use the eslint-plugin-vee-validate-migrator in your project:

1. Clone the repository to a local directory:
    ```sh
    git clone git@github.com:ynhhoJ/eslint-plugin-vee-validate-migrator.git
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Build the package:
    ```sh
    npm run build
    ```

4. In your main project, install the package using a relative path to where the `eslint-plugin-vee-validate-migrator` is located:
    ```sh
    npm install path/to/eslint-plugin-vee-validate-migrator
    ```
   Replace `path/to/eslint-plugin-vee-validate-migrator` with the actual path to the cloned repository.

5. Configure your `.eslintrc` file to use the plugin. Add the following configuration:
    ```json
    {
      "plugins": ["vee-validate-migrator"],
      "rules": {
        "vee-validate-migrator/validation-provider": "error"
      }
    }
    ```

This ESLint rule was based on my assumption based on differences between **Vee Validate v3** (red) and **Vee Validate v4** (green):

  ```diff
  <template>
  -  <ValidationObserver v-slot="{ handleSubmit, invalid }">
  -    <ValidationProvider
  -      v-slot="{ errors }"
  +  <Form v-slot="{ handleSubmit, meta }">
  +    <Field
  +      v-slot="{ field, errors, value }"
  +      v-model="input"
        name="User Name"
        rules="required"
      >
        <field
          label="Utilizator"
          message="User Name"
          :type="{ 'is-danger': errors.length }"
        >
  -        <input v-model="input" placeholder="test" />
  +        <input :model-value="value" v-bind="field" placeholder="test" />
        </field>
  -    </ValidationProvider>
  +    </Field>
  
  -    <button :disabled="invalid" @click="handleSubmit(onSubmit)">
  +    <button :disabled="!meta.valid" @click="handleSubmit(onSubmit)">
        Submit
      </button>
  -  </ValidationObserver>
  +  </Form>
  </template>
  
  <script>
  -import { ValidationObserver, ValidationProvider } from 'vee-validate'
  +import { Form, Field } from 'vee-validate'
  
  export default {
    components: {
  -    ValidationObserver,
  -    ValidationProvider
  +    Form,
  +    Field,
    },
  
    data() {
      return {
        input: 'Hello, world!'
      }
    },
  
    methods: {
      onSubmit() {
        console.log(this.input)
      },
    },
  }
  </script>
  ```

According to [Field](https://vee-validate.logaretm.com/v4/api/field) `tag` property should be replaced with `as`.
Example:
```diff
-<ValidationProvider
+<Field
  v-slot="{ errors, field, value }"
  v-model="articleName"
  name="Name"
  class="column is-10"
- tag="div"
+ as="div"
  rules="required"
/>
```
