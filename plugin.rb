# name: discourse-osf-plugin
# about: plugin to insert OSF specific customizations
# version: 0.1
# author: Joshua Bird, Acshi Haggenmiller

enabled_site_setting :osf_plugin_active

register_asset 'stylesheets/osf-plugin.scss'
register_custom_html(top:
    "<link href='//fonts.googleapis.com/css?family=Carrois+Gothic|Inika|Patua+One' rel='stylesheet' type='text/css'>
     <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,300,700' rel='stylesheet' type='text/css'>")

after_initialize do
    require_dependency 'application_controller'

    ApplicationController.class_eval do
        before_filter :prepend_view_paths

        # Allow our comments.html.erb or related files override the defaults
        def prepend_view_paths
            prepend_view_path "plugins/discourse-osf-plugin/views"
        end
    end
end
